ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS quote_version integer NOT NULL DEFAULT 1 CHECK (quote_version > 0);
ALTER TABLE quote_decisions ADD COLUMN IF NOT EXISTS quote_version integer NOT NULL DEFAULT 1 CHECK (quote_version > 0);
-- Backfill uma única vez; novos registros já recebem a versão explícita do agregado.
CREATE TABLE IF NOT EXISTS schema_migrations (name varchar(100) PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE name = '0003_quote_version_backfill') THEN
UPDATE work_orders w SET quote_version = GREATEST(w.quote_version, 1 + (
  SELECT COUNT(*)::integer FROM status_history h WHERE h.work_order_id = w.id
  AND h.from_status = 'IN_PROGRESS' AND h.to_status = 'AWAITING_APPROVAL'
));
UPDATE quote_decisions d SET quote_version = GREATEST(d.quote_version, 1 + (
  SELECT COUNT(*)::integer FROM status_history h WHERE h.work_order_id = d.work_order_id
  AND h.from_status = 'IN_PROGRESS' AND h.to_status = 'AWAITING_APPROVAL'
  AND h.created_at <= d.created_at
));
    INSERT INTO schema_migrations (name) VALUES ('0003_quote_version_backfill');
  END IF;
END $$;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS domain_events (
  sequence bigserial UNIQUE NOT NULL,
  id uuid PRIMARY KEY,
  name varchar(80) NOT NULL,
  aggregate_type varchar(40) NOT NULL,
  aggregate_id varchar(64) NOT NULL,
  occurred_at timestamptz NOT NULL,
  payload jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS domain_events_aggregate ON domain_events (aggregate_type, aggregate_id, sequence);
