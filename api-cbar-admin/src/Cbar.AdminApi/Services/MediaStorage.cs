using Minio;
using Minio.DataModel.Args;

namespace Cbar.AdminApi.Services;

public class MediaStorageOptions
{
    public string Endpoint { get; set; } = "http://localhost:9002";
    public string AccessKey { get; set; } = "cbar";
    public string SecretKey { get; set; } = "cbar_local_dev";
    public string Bucket { get; set; } = "cbar-media";

    /// <summary>
    /// Only consulted when <see cref="Endpoint"/> carries no scheme, which is how Vault
    /// stores it ("host:port", MinIO's own convention). In-cluster MinIO is plain HTTP,
    /// so this defaults to false; set MediaStorage__UseSsl=true when the endpoint is
    /// behind TLS. Guessing from the port was the wrong call — it silently produced
    /// https:// against a plaintext MinIO, which surfaced as a 500 on upload.
    /// </summary>
    public bool UseSsl { get; set; }

    /// <summary>
    /// Region used to sign requests. It is part of the SigV4 credential scope, so a
    /// MinIO deployment configured with its own region rejects the SDK's "us-east-1"
    /// default with 400 AuthorizationHeaderMalformed — and on HEAD requests (bucket
    /// existence checks) the explanatory body is stripped, leaving only an opaque 400.
    /// The server advertises its value in the x-amz-bucket-region response header.
    /// Empty keeps the SDK default, which is what local docker-compose MinIO wants.
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

/// <summary>
/// Talks to MinIO through its own .NET client rather than the AWS S3 SDK. The AWS SDK
/// v4 enables request checksums by default, which sends every upload as an aws-chunked
/// body with a trailing CRC32 — MinIO rejects that, so uploads failed here while the
/// same server served other services fine.
/// </summary>
public class MediaStorage
{
    private readonly IMinioClient _minio;
    private readonly string _bucket;
    private readonly bool _mayCreateBucket;
    private bool _bucketEnsured;

    public MediaStorage(IConfiguration config, IHostEnvironment env)
    {
        var opt = config.GetSection("MediaStorage").Get<MediaStorageOptions>() ?? new MediaStorageOptions();
        _bucket = opt.Bucket;
        _mayCreateBucket = env.IsDevelopment();

        var endpoint = opt.NormalizedEndpoint();
        // WithEndpoint takes host[:port] only — the scheme is carried separately by
        // WithSSL, so the normalized URI has to be split back apart here.
        var client = new MinioClient()
            .WithEndpoint(endpoint.Authority)
            .WithCredentials(opt.AccessKey, opt.SecretKey)
            .WithSSL(endpoint.Scheme == Uri.UriSchemeHttps);

        if (!string.IsNullOrWhiteSpace(opt.Region))
            client = client.WithRegion(opt.Region);

        _minio = client.Build();
    }

    public async Task PutAsync(string key, Stream content, string contentType, CancellationToken ct = default)
    {
        if (!_bucketEnsured)
        {
            var exists = await _minio.BucketExistsAsync(
                new BucketExistsArgs().WithBucket(_bucket), ct);
            if (!exists)
            {
                // Outside Development a missing bucket means the name is misconfigured;
                // creating it would silently divert uploads away from the real one.
                if (!_mayCreateBucket)
                    throw new InvalidOperationException(
                        $"MediaStorage bucket '{_bucket}' does not exist at the configured endpoint.");
                await _minio.MakeBucketAsync(new MakeBucketArgs().WithBucket(_bucket), ct);
            }
            _bucketEnsured = true;
        }

        // PutObjectArgs needs the length up front; a non-seekable stream can't give one,
        // so it gets buffered rather than guessed at. IFormFile streams are seekable
        // (disk-backed), so uploads never take this path.
        if (!content.CanSeek)
        {
            var buffer = new MemoryStream();
            await content.CopyToAsync(buffer, ct);
            buffer.Position = 0;
            content = buffer;
        }

        await _minio.PutObjectAsync(new PutObjectArgs()
            .WithBucket(_bucket)
            .WithObject(key)
            .WithStreamData(content)
            .WithObjectSize(content.Length - content.Position)
            .WithContentType(contentType), ct);
    }

    /// <summary>
    /// Streams an object into <paramref name="callback"/> rather than returning a Stream —
    /// that is the client's model. A missing object throws ObjectNotFoundException before
    /// the callback runs, so callers can still answer with a clean 404.
    /// </summary>
    public Task GetAsync(string key, Func<Stream, CancellationToken, Task> callback, CancellationToken ct) =>
        _minio.GetObjectAsync(new GetObjectArgs()
            .WithBucket(_bucket)
            .WithObject(key)
            .WithCallbackStream(callback), ct);

    public Task DeleteAsync(string key) =>
        _minio.RemoveObjectAsync(new RemoveObjectArgs().WithBucket(_bucket).WithObject(key));

    /// <summary>
    /// The stored object's size in bytes, or null when there is no such object (spec 054 FR-032). Any other
    /// failure (storage unreachable, bad credentials) throws, so a caller can tell "missing" from "not asked".
    /// </summary>
    public async Task<long?> SizeAsync(string key, CancellationToken ct)
    {
        try
        {
            var stat = await _minio.StatObjectAsync(new StatObjectArgs().WithBucket(_bucket).WithObject(key), ct);
            return stat.Size;
        }
        catch (Minio.Exceptions.ObjectNotFoundException)
        {
            return null;
        }
    }
}
