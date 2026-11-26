using Cbar.Domain;
using Cbar.Domain.Entities;
using Cbar.WebApi;
using Cbar.WebApi.Controllers;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.ResponseCompression;
using System.IO.Compression;
using System.Threading.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Minio;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, cfg) => cfg
    .ReadFrom.Configuration(ctx.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console());

builder.Services.AddDbContext<CbarDbContext>(opt => opt
    .UseNpgsql(builder.Configuration.GetConnectionString("Cbar"),
        npgsql => npgsql.MapEnum<ContentStatus>("content_status"))
    .UseSnakeCaseNamingConvention());

builder.Services.AddStackExchangeRedisCache(opt =>
    opt.Configuration = builder.Configuration.GetConnectionString("Redis"));

builder.Services.Configure<MediaStorageOptions>(
    builder.Configuration.GetSection(MediaStorageOptions.SectionName));
// MinIO's own client, not the AWS S3 SDK: the SDK's v4 default request checksums
// (aws-chunked bodies with a CRC32 trailer) are rejected by MinIO. api-cbar-admin
// uses the same client — keep the two in step.
builder.Services.AddSingleton<IMinioClient>(sp =>
{
    var opt = sp.GetRequiredService<IOptions<MediaStorageOptions>>().Value;

    var endpoint = opt.NormalizedEndpoint();
    // WithEndpoint takes host[:port] only — the scheme is carried separately by
    // WithSSL, so the normalized URI has to be split back apart here.
    var client = new MinioClient()
        .WithEndpoint(endpoint.Authority)
        .WithCredentials(opt.AccessKey, opt.SecretKey)
        .WithSSL(endpoint.Scheme == Uri.UriSchemeHttps);

    if (!string.IsNullOrWhiteSpace(opt.Region))
        client = client.WithRegion(opt.Region);

    return client.Build();
});

builder.Services.AddControllers().AddXmlSerializerFormatters();
builder.Services.AddOpenApi();

// Kestrel does not compress anything on its own, and one SSR page view pulls several
// JSON documents down this pipe. Media bytes are left alone: images, video and the
// archive formats the CMS serves are already compressed, so a second pass only burns
// CPU. EnableForHttps is safe here because these responses carry no session — nothing
// a BREACH-style attack could aim at.
builder.Services.AddResponseCompression(opt =>
{
    opt.EnableForHttps = true;
    opt.MimeTypes =
    [
        "text/plain",
        "text/css",
        "text/xml",
        "text/javascript",
        "application/json",
        "application/xml",
        "application/javascript",
        "image/svg+xml",
    ];
});
builder.Services.Configure<BrotliCompressionProviderOptions>(
    opt => opt.Level = CompressionLevel.Fastest);
builder.Services.Configure<GzipCompressionProviderOptions>(
    opt => opt.Level = CompressionLevel.Fastest);
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("Cbar")!);

builder.Services.AddRateLimiter(opt =>
{
    opt.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    // Partition per client IP so one caller can't starve the rest. The window
    // is generous because the SSR frontend fans each page view out into
    // several API calls (pages tree, page detail, homepage blocks, …).
    opt.AddPolicy("public", httpContext =>
    {
        var clientIp =
            httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault()?.Split(',')[0].Trim()
            ?? httpContext.Connection.RemoteIpAddress?.ToString()
            ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(clientIp, _ => new FixedWindowRateLimiterOptions
        {
            Window = TimeSpan.FromMinutes(1),
            PermitLimit = 1000,
        });
    });
});

var app = builder.Build();

MigrationRunner.Apply(
    builder.Configuration.GetConnectionString("Migrations")
        ?? builder.Configuration.GetConnectionString("Cbar")!,
    Path.Combine(AppContext.BaseDirectory, "db", "migrations"),
    app.Logger);

app.UseSerilogRequestLogging();
// Ahead of the rate limiter so a rejected request never reaches the compressor.
app.UseResponseCompression();
app.MapOpenApi();
app.UseRateLimiter();
app.MapControllers().RequireRateLimiting("public");
app.MapHealthChecks("/healthz");

app.Run();
