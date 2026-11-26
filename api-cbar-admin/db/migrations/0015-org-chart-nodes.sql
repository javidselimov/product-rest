-- Organisational chart ("Struktur və əsasnamələr", Figma `2007:86377` desktop, `2007:86365`
-- tablet, `2007:86347` mobile): the governor → deputies → director generals → blocks /
-- departments tree that used to be one uploaded image. Each node either links to a staff
-- member or a division (the public card opens that page and shows its name/position) or
-- carries its own title; per-locale title/subtitle override the linked texts.
--
-- Tablet and mobile stack the tree from parent_id + sort_order. Desktop places every card by
-- hand on a 984 px canvas (x/y/w/h in CSS px) to match Figma exactly; `connector` is an
-- optional hand-drawn line to the parent as a JSON array of [x, y] points, null for the
-- automatic elbow line.
CREATE TABLE IF NOT EXISTS org_chart_nodes (
    id             serial PRIMARY KEY,
    parent_id      integer REFERENCES org_chart_nodes(id) ON DELETE RESTRICT,
    kind           smallint NOT NULL CHECK (kind BETWEEN 1 AND 6),
    staff_id       integer,
    division_id    integer,
    curator_direct boolean NOT NULL DEFAULT false,
    sort_order     integer NOT NULL DEFAULT 0,
    is_active      boolean NOT NULL DEFAULT true,
    x              numeric(7,2),
    y              numeric(7,2),
    w              numeric(7,2),
    h              numeric(7,2),
    connector      jsonb,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now(),
    CHECK (staff_id IS NULL OR division_id IS NULL),
    CHECK ((x IS NULL) = (y IS NULL) AND (x IS NULL) = (w IS NULL) AND (x IS NULL) = (h IS NULL))
);

CREATE INDEX IF NOT EXISTS ix_org_chart_nodes_parent ON org_chart_nodes (parent_id, sort_order);

CREATE TABLE IF NOT EXISTS org_chart_node_translations (
    id       bigserial PRIMARY KEY,
    node_id  integer NOT NULL REFERENCES org_chart_nodes(id) ON DELETE CASCADE,
    locale   varchar(5) NOT NULL REFERENCES locales(code),
    title    varchar(500),
    subtitle varchar(500),
    UNIQUE (node_id, locale)
);

-- Links to organization_staff / organization_divisions need the REFERENCES privilege on
-- tables this role may not own (see 0014); add the FKs only where granted, so the migration
-- never blocks a deploy. Without them the staff and division DELETE endpoints clear the link
-- themselves, and every read joins the linked table, so a dangling id reads as "not linked".
DO $$
BEGIN
    IF has_table_privilege('organization_staff', 'REFERENCES')
       AND NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'fk_org_chart_nodes_staff_id') THEN
        ALTER TABLE org_chart_nodes
            ADD CONSTRAINT fk_org_chart_nodes_staff_id
            FOREIGN KEY (staff_id) REFERENCES organization_staff(id) ON DELETE SET NULL;
    END IF;
    IF has_table_privilege('organization_divisions', 'REFERENCES')
       AND NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'fk_org_chart_nodes_division_id') THEN
        ALTER TABLE org_chart_nodes
            ADD CONSTRAINT fk_org_chart_nodes_division_id
            FOREIGN KEY (division_id) REFERENCES organization_divisions(id) ON DELETE SET NULL;
    END IF;
END $$;

-- api-cbar reads these tables as cbar_web_ro (0001 grants SELECT on existing tables only).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        GRANT SELECT ON org_chart_nodes, org_chart_node_translations TO cbar_web_ro;
    END IF;
END $$;
