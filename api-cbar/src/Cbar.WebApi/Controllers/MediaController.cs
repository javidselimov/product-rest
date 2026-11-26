using Cbar.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;
using Minio;
using Minio.DataModel.Args;
using Minio.Exceptions;

namespace Cbar.WebApi.Controllers;

public class MediaStorageOptions
{
    public const string SectionName = "MediaStorage";

    public string Endpoint { get; set; } = "http://localhost:9002";
    public string AccessKey { get; set; } = "cbar";
    public string SecretKey { get; set; } = "cbar_local_dev";
    public string Bucket { get; set; } = "cbar-media";

    /// <summary>
    /// Only consulted when <see cref="Endpoint"/> carries no scheme, which is how Vault
    /// stores it ("host:port", MinIO's own convention). In-cluster MinIO is plain HTTP,
    /// so this defaults to false; set MediaStorage__UseSsl=true when the endpoint is
    /// behind TLS. Must match what api-cbar-admin is configured with — both APIs talk to
    /// the same MinIO.
    /// </summary>
    public bool UseSsl { get; set; }

    /// <summary>
    /// Region used to sign requests. It is part of the SigV4 credential scope, so a
    /// MinIO deployment configured with its own region rejects the SDK's "us-east-1"
    /// default with 400 AuthorizationHeaderMalformed. The server advertises its value
    /// in the x-amz-bucket-region response header. Empty keeps the SDK default, which
    /// is what local docker-compose MinIO wants. Must match api-cbar-admin's value —
    /// both APIs talk to the same MinIO.
    /// </summary>
    public string Region { get; set; } = "";

    public Uri NormalizedEndpoint()
    {
        var value = (Endpoint ?? string.Empty).Trim();
        if (value.Length == 0)
            throw new InvalidOperationException("MediaStorage:Endpoint is not configured.");

        if (!value.Contains("://", StringComparison.Ordinal))
            value = (UseSsl ? "https://" : "http://") + value;

        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
            throw new InvalidOperationException(
                $"MediaStorage:Endpoint '{Endpoint}' is not a valid http(s) URI.");

        return uri;
    }
}

[ApiController]
public class MediaController(
    CbarDbContext db,
    IMinioClient minio,
    IOptions<MediaStorageOptions> options) : ControllerBase
{
    /// <summary>
    /// Uploads are content-addressed by SHA-256 (api-cbar-admin's MediaStorage stores
    /// identical bytes once), so the bytes behind a given id never change. That makes the
    /// response safely immutable for a year — without this header every page view
    /// re-downloaded every image, because nothing here ever let the browser cache one.
    /// </summary>
    private const string ImmutableCacheControl = "public, max-age=31536000, immutable";

    /// <summary>
    /// Same policy as api-cbar-admin's preview. An SVG — or an XML file carrying XHTML — opened
    /// directly from this URL would otherwise run its script on a cbar.az subdomain. Embedding as
    /// &lt;img&gt; or a CSS background ignores the response's CSP, so the site is unaffected, and
    /// PDFs still open in the browser's viewer under it (checked before rollout, spec 019).
    /// </summary>
    private const string SandboxPolicy = "default-src 'none'; style-src 'unsafe-inline'; sandbox";

    /// <summary>Streams a media asset (soft-deleted assets are hidden by the global query filter).</summary>
    [HttpGet("media/{id:long}")]
    public async Task<IActionResult> Get(long id, CancellationToken ct)
    {
        var asset = await db.MediaAssets
            .Where(m => m.Id == id)
            .Select(m => new { m.StorageKey, m.OriginalName, m.MimeType, m.ChecksumSha256 })
            .FirstOrDefaultAsync(ct);

        if (asset is null)
            return NotFound();

        // The checksum is already a strong validator, so it becomes the ETag as-is.
        var etag = new EntityTagHeaderValue($"\"{asset.ChecksumSha256}\"");

        if (MatchesIfNoneMatch(etag))
        {
            // Revalidation hit: answered without touching object storage at all.
            Response.Headers[HeaderNames.CacheControl] = ImmutableCacheControl;
            Response.Headers[HeaderNames.ETag] = etag.ToString();
            return StatusCode(StatusCodes.Status304NotModified);
        }

        var disposition = new ContentDispositionHeaderValue("inline");
        disposition.SetHttpFileName(asset.OriginalName);

        try
        {
            // The client streams into a callback instead of handing back a Stream, so the
            // object is written straight to the response body. The headers are set inside
            // the callback: by then the object is known to exist and nothing has been
            // flushed yet, so a missing one still comes back as a clean 404.
            await minio.GetObjectAsync(new GetObjectArgs()
                .WithBucket(options.Value.Bucket)
                .WithObject(asset.StorageKey)
                .WithCallbackStream(async (stream, token) =>
                {
                    Response.Headers[HeaderNames.ContentDisposition] = disposition.ToString();
                    // Set alongside the other headers rather than before the call: a missing
                    // object still has to come back as a clean, uncached 404.
                    Response.Headers[HeaderNames.CacheControl] = ImmutableCacheControl;
                    Response.Headers[HeaderNames.ETag] = etag.ToString();
                    // Every type, old migrated files included: the browser must follow the
                    // declared type, and a document opened from here must not run script.
                    Response.Headers[HeaderNames.XContentTypeOptions] = "nosniff";
                    Response.Headers[HeaderNames.ContentSecurityPolicy] = SandboxPolicy;
                    Response.ContentType = asset.MimeType;
                    // No Content-Length from media_assets.size_bytes: migrated rows carry
                    // made-up sizes (2008 for a 157 KB PNG), and Kestrel aborts the response
                    // the moment the real bytes overrun a declared length — images came back
                    // truncated or as a 500. Without it the object streams chunked at its
                    // actual size.
                    await stream.CopyToAsync(Response.Body, token);
                }), ct);

            return new EmptyResult();
        }
        catch (Exception ex) when (ex is ObjectNotFoundException or BucketNotFoundException)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// True when the request already holds this version. `If-None-Match: *` matches any
    /// existing representation (RFC 9110 §13.1.2); weak comparison is the one the spec
    /// prescribes for GET, and it costs nothing here since the tag is always strong.
    /// </summary>
    private bool MatchesIfNoneMatch(EntityTagHeaderValue etag)
    {
        var candidates = Request.GetTypedHeaders().IfNoneMatch;
        if (candidates is null || candidates.Count == 0)
            return false;

        return candidates.Any(candidate =>
            candidate.Tag == "*" || candidate.Compare(etag, useStrongComparison: false));
    }
}
