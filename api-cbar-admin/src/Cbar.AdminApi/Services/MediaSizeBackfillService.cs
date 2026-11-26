using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Services;

/// <summary>
/// Corrects the sizes the legacy import made up (spec 054 FR-032, research R10). Files moved from the old site carry
/// 1064 or 2008/2009 bytes in <c>media_assets.size_bytes</c> whatever their real size, so every file card showed a wrong
/// size. Once per file this reads the object's real size from storage, fixes the row when it differs, and records the
/// check in <c>media_asset_details</c> (0040), so a restart does not check the file again; uploads record their own row.
///
/// Runs in the background after the migrations and never blocks startup. A session-level advisory lock keeps it to one
/// instance. A file missing from storage is logged and recorded anyway; a storage failure stops the run without
/// recording anything, so the next start tries again.
/// </summary>
public sealed class MediaSizeBackfillService(IServiceScopeFactory scopes, MediaStorage storage, ILogger<MediaSizeBackfillService> logger)
    : BackgroundService
{
    // Not the migration lock (MigrationRunner): this one is held while the run lasts.
    private const long LockKey = 0x0CB054;
    private const int BatchSize = 100;

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        try
        {
            await RunAsync(ct);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            // Shutting down; the rows not yet checked are checked on the next start.
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "media sizes: run stopped, will retry on the next start");
        }
    }

    private async Task RunAsync(CancellationToken ct)
    {
        await using var scope = scopes.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<CbarDbContext>();

        // The lock is held by the session, so the context keeps one open connection for the whole run.
        await db.Database.OpenConnectionAsync(ct);
        var locked = await db.Database.SqlQuery<bool>($"SELECT pg_try_advisory_lock({LockKey}) AS \"Value\"").SingleAsync(ct);
        if (!locked)
        {
            logger.LogInformation("media sizes: another instance is checking, skipped");
            return;
        }

        int checkedCount = 0, fixedCount = 0, missingCount = 0;
        try
        {
            while (!ct.IsCancellationRequested)
            {
                var batch = await db.MediaAssets.AsNoTracking()
                    .Where(m => !db.MediaAssetDetails.Any(d => d.MediaId == m.Id))
                    .OrderBy(m => m.Id)
                    .Select(m => new { m.Id, m.StorageKey, m.SizeBytes })
                    .Take(BatchSize)
                    .ToListAsync(ct);
                if (batch.Count == 0)
                    break;

                var now = DateTimeOffset.UtcNow;
                foreach (var media in batch)
                {
                    // Throws when storage is unreachable: the batch is left unrecorded and the run stops.
                    var size = await storage.SizeAsync(media.StorageKey, ct);
                    if (size is null)
                    {
                        missingCount++;
                        logger.LogWarning("media sizes: object {StorageKey} of media {MediaId} is missing", media.StorageKey, media.Id);
                    }
                    else if (size != media.SizeBytes)
                    {
                        fixedCount++;
                        await db.MediaAssets.IgnoreQueryFilters().Where(m => m.Id == media.Id)
                            .ExecuteUpdateAsync(s => s.SetProperty(m => m.SizeBytes, size.Value), ct);
                    }
                    db.MediaAssetDetails.Add(new MediaAssetDetail { MediaId = media.Id, SizeVerifiedAt = now });
                    checkedCount++;
                }
                await db.SaveChangesAsync(ct);
                db.ChangeTracker.Clear();
            }
        }
        finally
        {
            await db.Database.ExecuteSqlAsync($"SELECT pg_advisory_unlock({LockKey})", CancellationToken.None);
        }

        logger.LogInformation("media sizes: checked {Checked}, fixed {Fixed}, missing {Missing}", checkedCount, fixedCount, missingCount);
    }
}
