-- Role-based permissions (spec 008-admin-rbac-four-eyes 1a, data-model §1–§3): seeds the
-- permission catalog and the moderator and meas_manager rows of the role → permission matrix
-- into the permissions / role_permissions tables that 0001 created and nothing used.
--
-- The catalog is the same 98 codes as Authorization/Permissions.cs; both are generated from
-- one list, and the API logs an Error at startup for any code missing here. A future
-- permission is a new migration plus a new constant, nothing more.
--
-- No rows for admin: the API grants admin every permission in code (research R2), so an
-- admin can never be locked out by a missing or forgotten row. Roles are found by code, not
-- id, as ids may differ between environments.
--
-- Conditional, like the FK blocks in 0007/0008: where the migrating role may not insert into
-- these tables the seed is skipped with a WARNING instead of blocking the deploy. The API then
-- fails closed — only admin can act — and logs the missing catalog at startup (spec FR-002).
DO $$
BEGIN
    IF NOT has_table_privilege('permissions', 'INSERT')
       OR NOT has_table_privilege('role_permissions', 'INSERT') THEN
        RAISE WARNING 'spec 008: no INSERT privilege on permissions/role_permissions, RBAC seed skipped';
        RETURN;
    END IF;

    INSERT INTO permissions (code, description) VALUES
        ('pages.read', 'Read pages'),
        ('pages.create', 'Create pages'),
        ('pages.update', 'Edit pages'),
        ('pages.delete', 'Delete pages'),
        ('pages.delete_subtree', 'Delete a page together with its whole subtree'),
        ('press_releases.read', 'Read press releases'),
        ('press_releases.create', 'Create press releases'),
        ('press_releases.update', 'Edit press releases'),
        ('press_releases.delete', 'Delete press releases'),
        ('banners.read', 'Read banners'),
        ('banners.create', 'Create banners'),
        ('banners.update', 'Edit banners'),
        ('banners.delete', 'Delete banners'),
        ('galleries.read', 'Read photo galleries'),
        ('galleries.create', 'Create photo galleries'),
        ('galleries.update', 'Edit photo galleries'),
        ('galleries.delete', 'Delete photo galleries'),
        ('homepage_links.read', 'Read homepage links'),
        ('homepage_links.create', 'Create homepage links'),
        ('homepage_links.update', 'Edit homepage links'),
        ('homepage_links.delete', 'Delete homepage links'),
        ('homepage_publications.read', 'Read homepage publications'),
        ('homepage_publications.create', 'Create homepage publications'),
        ('homepage_publications.update', 'Edit homepage publications'),
        ('homepage_publications.delete', 'Delete homepage publications'),
        ('image_popups.read', 'Read image popups'),
        ('image_popups.create', 'Create image popups'),
        ('image_popups.update', 'Edit image popups'),
        ('image_popups.delete', 'Delete image popups'),
        ('info_lines.read', 'Read info lines'),
        ('info_lines.create', 'Create info lines'),
        ('info_lines.update', 'Edit info lines'),
        ('info_lines.delete', 'Delete info lines'),
        ('running_lines.read', 'Read running lines'),
        ('running_lines.create', 'Create running lines'),
        ('running_lines.update', 'Edit running lines'),
        ('running_lines.delete', 'Delete running lines'),
        ('news_slider.read', 'Read news slider items'),
        ('news_slider.create', 'Create news slider items'),
        ('news_slider.update', 'Edit news slider items'),
        ('news_slider.delete', 'Delete news slider items'),
        ('videos.read', 'Read videos'),
        ('videos.create', 'Create videos'),
        ('videos.update', 'Edit videos'),
        ('videos.delete', 'Delete videos'),
        ('video_streams.read', 'Read live video streams'),
        ('video_streams.create', 'Create live video streams'),
        ('video_streams.update', 'Edit live video streams'),
        ('video_streams.delete', 'Delete live video streams'),
        ('laws.read', 'Read legal acts'),
        ('laws.create', 'Create legal acts'),
        ('laws.update', 'Edit legal acts'),
        ('laws.delete', 'Delete legal acts'),
        ('law_categories.read', 'Read law categories'),
        ('law_categories.create', 'Create law categories'),
        ('law_categories.update', 'Edit law categories'),
        ('law_categories.delete', 'Delete law categories'),
        ('money_marks.read', 'Read money marks, their categories and news'),
        ('money_marks.create', 'Create money marks, their categories and news'),
        ('money_marks.update', 'Edit money marks, their categories and news'),
        ('money_marks.delete', 'Delete money marks, their categories and news'),
        ('organization.read', 'Read organization divisions, offices and staff'),
        ('organization.create', 'Create organization divisions, offices and staff'),
        ('organization.update', 'Edit organization divisions, offices and staff'),
        ('organization.delete', 'Delete organization divisions, offices and staff'),
        ('azir.read', 'Read AZIR index values'),
        ('azir.create', 'Create AZIR index values'),
        ('azir.delete', 'Delete AZIR index values'),
        ('inflation.read', 'Read inflation parameters and settings'),
        ('inflation.create', 'Create inflation parameters and settings'),
        ('inflation.update', 'Edit inflation parameters and settings'),
        ('inflation.delete', 'Delete inflation parameters and settings'),
        ('yield_curves.read', 'Read yield curves'),
        ('yield_curves.create', 'Create yield curves'),
        ('yield_curves.update', 'Edit yield curves'),
        ('yield_curves.delete', 'Delete yield curves'),
        ('currencies.read', 'Read currency names and flags'),
        ('currencies.update', 'Edit currency names and flags'),
        ('currency_rates.read', 'Read official exchange rates'),
        ('currency_rates.prepare', 'Prepare (submit, correct or request deletion of) official exchange rates'),
        ('currency_rates.approve', 'Approve or return a request on official exchange rates'),
        ('meas.read', 'Read MEAS documents, emitents and information types'),
        ('meas.create', 'Create MEAS documents, emitents and information types'),
        ('meas.update', 'Edit MEAS documents, emitents and information types'),
        ('meas.delete', 'Delete MEAS documents, emitents and information types'),
        ('media.read', 'Read media library files'),
        ('media.create', 'Create media library files'),
        ('media.delete', 'Delete media library files'),
        ('media.delete_own', 'Delete own uploads in media library files'),
        ('settings.read', 'Read site settings'),
        ('settings.update', 'Edit site settings'),
        ('settings.delete', 'Delete site settings'),
        ('users.read', 'Read CMS users'),
        ('users.create', 'Create CMS users'),
        ('users.update', 'Edit CMS users'),
        ('users.delete', 'Delete CMS users'),
        ('roles.read', 'Read roles and their permissions'),
        ('audit.read', 'Read the audit log')
    ON CONFLICT (code) DO NOTHING;

    -- moderator: every content, finance, MEAS and media permission (legacy MainController and
    -- meas/BaseController), but not the subtree delete, rate approval or system administration.
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    JOIN permissions p ON p.code <> ALL (ARRAY[
        'pages.delete_subtree', 'currency_rates.approve', 'settings.read', 'settings.update',
        'settings.delete', 'users.read', 'users.create', 'users.update', 'users.delete',
        'roles.read', 'audit.read'])
    WHERE r.code = 'moderator'
    ON CONFLICT DO NOTHING;

    -- meas_manager: MEAS only, plus uploading and deleting its own media (legacy HomeController).
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    JOIN permissions p ON p.code = ANY (ARRAY[
        'meas.read', 'meas.create', 'meas.update', 'meas.delete', 'media.read', 'media.create',
        'media.delete_own'])
    WHERE r.code = 'meas_manager'
    ON CONFLICT DO NOTHING;
END $$;
