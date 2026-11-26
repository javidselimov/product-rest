using System.Security.Cryptography;

namespace Cbar.AdminApi.Services;

/// <summary>
/// One bcrypt cost for every hash the API produces. Login verifies against
/// <see cref="DummyHash"/> when the username is unknown, so a miss costs as much
/// as a wrong password and the response time does not reveal which usernames
/// exist. Raising <see cref="WorkFactor"/> raises both together — a dummy left at
/// the old cost would reopen the timing gap.
/// </summary>
public static class PasswordHashing
{
    public const int WorkFactor = 12;

    /// <summary>
    /// Hash of a random password that is never stored, so nothing verifies against
    /// it. Login rejects an unknown user regardless of the result.
    /// </summary>
    public static readonly string DummyHash =
        BCrypt.Net.BCrypt.HashPassword(Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)), workFactor: WorkFactor);
}
