namespace Cbar.AdminApi.Validation;

/// <summary>
/// Setting keys a new <c>PUT /settings/{key}</c> may create (spec 008 FR-020). Every key here is
/// read by something; a key nothing reads is just a place to hide data. Keys already stored can
/// still be replaced or deleted whether listed or not.
/// </summary>
public static class KnownSettings
{
    public static readonly IReadOnlySet<string> Keys = new HashSet<string>(StringComparer.Ordinal)
    {
        // api-cbar SiteSettingsController: the public site's accessibility widget (spec 007).
        "accessibility.widget",
    };
}
