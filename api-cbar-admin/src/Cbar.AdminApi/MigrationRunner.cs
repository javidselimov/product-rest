using Npgsql;

namespace Cbar.AdminApi;

/// <summary>
/// In-process SQL migrator, run at startup before the app serves traffic.
/// All apps sharing the cbar database record applied migrations in the same
/// <c>schema_migrations</c> table, keyed by full filename — so filenames must be
/// globally unique across apps, and files must not contain BEGIN/COMMIT
/// (the runner wraps each file in its own transaction).
/// </summary>
public static class MigrationRunner
{
    // Arbitrary app-wide advisory lock key so concurrent instances don't race.
    private const long LockKey = 0x0CBA5;

    public static void Apply(string connectionString, string migrationsDir, ILogger logger, string? devSeedFile = null)
    {
        var files = Directory.Exists(migrationsDir)
            ? Directory.GetFiles(migrationsDir, "*.sql")
                .OrderBy(Path.GetFileName, StringComparer.Ordinal)
                .ToArray()
            : [];
        if (files.Length == 0 && devSeedFile is null)
            return;

        using var conn = new NpgsqlConnection(connectionString);
        conn.Open();

        Exec(conn, $"SELECT pg_advisory_lock({LockKey});");
        try
        {
            Exec(conn, """
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    version    text PRIMARY KEY,
                    applied_at timestamptz NOT NULL DEFAULT now()
                );
                """);

            var applied = new HashSet<string>();
            using (var cmd = new NpgsqlCommand("SELECT version FROM schema_migrations;", conn))
            using (var reader = cmd.ExecuteReader())
                while (reader.Read())
                    applied.Add(reader.GetString(0));

            foreach (var file in files)
            {
                var name = Path.GetFileName(file);
                if (applied.Contains(name))
                    continue;

                logger.LogInformation("Applying migration {Migration}", name);
                using var tx = conn.BeginTransaction();
                using (var cmd = new NpgsqlCommand(File.ReadAllText(file), conn, tx))
                    cmd.ExecuteNonQuery();
                using (var cmd = new NpgsqlCommand(
                           "INSERT INTO schema_migrations (version) VALUES (@version);", conn, tx))
                {
                    cmd.Parameters.AddWithValue("version", name);
                    cmd.ExecuteNonQuery();
                }
                tx.Commit();
            }

            if (devSeedFile is not null && File.Exists(devSeedFile))
                ApplyDevSeed(conn, devSeedFile, logger);
        }
        finally
        {
            Exec(conn, $"SELECT pg_advisory_unlock({LockKey});");
        }
    }

    private static void ApplyDevSeed(NpgsqlConnection conn, string seedFile, ILogger logger)
    {
        using (var cmd = new NpgsqlCommand("SELECT count(*) FROM locales;", conn))
            if ((long)cmd.ExecuteScalar()! > 0)
                return;

        logger.LogInformation("Empty database — applying dev seed {Seed}", Path.GetFileName(seedFile));
        using var tx = conn.BeginTransaction();
        using (var cmd = new NpgsqlCommand(File.ReadAllText(seedFile), conn, tx))
            cmd.ExecuteNonQuery();
        tx.Commit();
    }

    private static void Exec(NpgsqlConnection conn, string sql)
    {
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.ExecuteNonQuery();
    }
}
