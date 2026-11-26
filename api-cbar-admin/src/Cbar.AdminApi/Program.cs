using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Cbar.AdminApi;
using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// {TraceId} is what an error response's `traceId` carries (its middle segment), so a
// reported failure can be found in the log (spec 018).
builder.Host.UseSerilog((ctx, cfg) => cfg
    .ReadFrom.Configuration(ctx.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {TraceId} {Message:lj}{NewLine}{Exception}"));

builder.Services.AddDbContext<CbarDbContext>(opt => opt
    .UseNpgsql(builder.Configuration.GetConnectionString("Cbar"),
        npgsql => npgsql.MapEnum<ContentStatus>("content_status"))
    .UseSnakeCaseNamingConvention());

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<AuditService>();
builder.Services.AddScoped<RefreshTokenService>();
builder.Services.AddScoped<SecurityStampService>();
builder.Services.AddSingleton<MediaStorage>();
// Starts with the host, i.e. after MigrationRunner.Apply below; corrects legacy media sizes once (spec 054).
builder.Services.AddHostedService<MediaSizeBackfillService>();
builder.Services.AddSingleton<LoginProtection>();

var jwt = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwt["SigningKey"]!)),
            ClockSkew = TimeSpan.FromSeconds(30),
        };
        // Revoked tokens (spec 020): Fail gives the standard 401 challenge, so the panel
        // refreshes and retries as for an expired token. Checked on every request, no cache.
        opt.Events = new JwtBearerEvents
        {
            OnTokenValidated = async ctx =>
            {
                var stamps = ctx.HttpContext.RequestServices.GetRequiredService<SecurityStampService>();
                if (await stamps.ValidateAsync(ctx.Principal!) is { } reason)
                    ctx.Fail(reason);
            },
        };
    });

builder.Services.AddAuthorization();
// Role-based permissions (spec 008): the token carries the role, PermissionMatrix turns it
// into permission codes, [RequirePermission] policies check them, and every refusal is
// audited. PermissionGuardFilter refuses actions that name no permission (default-deny).
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<PermissionMatrix>();
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
builder.Services.AddSingleton<IAuthorizationHandler, PermissionHandler>();
builder.Services.AddSingleton<IAuthorizationMiddlewareResultHandler, AuditingAuthorizationResultHandler>();
builder.Services.AddScoped<PermissionChecker>();
// Every error body is problem details (spec 018); database rejections become 400/409.
builder.Services.AddProblemDetails(ProblemDetailsSetup.Customize);
builder.Services.AddExceptionHandler<DbExceptionHandler>();
builder.Services.AddControllers(o => o.Filters.Add<PermissionGuardFilter>()).AddJsonOptions(o =>
    o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)));
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("Cbar")!);

// Credentials are allowed so the panel's auth calls can carry the refresh cookie
// (spec 005); that requires exact origins — never a wildcard.
builder.Services.AddCors(opt => opt.AddDefaultPolicy(p => p
    .WithOrigins(builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [])
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()));

var app = builder.Build();

MigrationRunner.Apply(
    builder.Configuration.GetConnectionString("Migrations")
        ?? builder.Configuration.GetConnectionString("Cbar")!,
    Path.Combine(AppContext.BaseDirectory, "db", "migrations"),
    app.Logger,
    devSeedFile: app.Environment.IsDevelopment()
        ? Path.Combine(AppContext.BaseDirectory, "db", "seed.sql")
        : null);

// After the migrations: an Error here means the permission seed was skipped and only admin
// can act (spec 008 FR-002).
await app.Services.GetRequiredService<PermissionMatrix>().VerifyCatalogAsync(app.Logger);

// Request logging stays outside the exception handler: it then logs the final status (a
// mapped 409 at Information), not every exception passing through it as a 500.
app.UseSerilogRequestLogging();
app.UseExceptionHandler(new ExceptionHandlerOptions { StatusCodeSelector = ProblemDetailsSetup.SelectStatusCode });
// Bodyless 4xx/5xx (JWT challenge, role check, unmatched route) get problem details too.
app.UseStatusCodePages();
// The generated document maps the whole admin API, so it is never served in
// Production (spec 014). Staging is dev and test, where openapi/scripts/drift-check.mjs
// reads it. An allowlist, so a new or misspelt environment name stays closed.
if (app.Environment.IsDevelopment() || app.Environment.IsStaging())
    app.MapOpenApi();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/healthz");

app.Run();
