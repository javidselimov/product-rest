-- Organisational chart, spec 060: the desktop chart is laid out from the tree instead of the
-- canvas positions of 0015. A block (kind 4) or group (kind 6) shows its departments as a
-- dropdown; the editor can keep them always open instead. That one setting lives here.
--
-- Companion table rather than an org_chart_nodes column: in shared environments existing
-- tables may be owned by another role and ALTER TABLE fails with "must be owner of table"
-- (same reason as 0016). A node without a row reads as false (dropdown), so the existing
-- nodes need no backfill. The x/y/w/h and connector columns of 0015 stay for a rollback.
CREATE TABLE IF NOT EXISTS org_chart_node_details (
    node_id          integer PRIMARY KEY,
    departments_open boolean NOT NULL DEFAULT false
);

-- The FK needs the REFERENCES privilege on org_chart_nodes; add it only where that is granted,
-- so the migration never blocks a deploy. Without it OrgChartController still deletes the row
-- with its node, and every read starts from org_chart_nodes, so a leftover row is never shown.
DO $$
BEGIN
    IF has_table_privilege('org_chart_nodes', 'REFERENCES')
       AND NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'fk_org_chart_node_details_node_id') THEN
        ALTER TABLE org_chart_node_details
            ADD CONSTRAINT fk_org_chart_node_details_node_id
            FOREIGN KEY (node_id) REFERENCES org_chart_nodes(id) ON DELETE CASCADE;
    END IF;
END $$;

-- api-cbar reads this table as cbar_web_ro (0001 grants SELECT on existing tables only).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        GRANT SELECT ON org_chart_node_details TO cbar_web_ro;
    END IF;
END $$;
