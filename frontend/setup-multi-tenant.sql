-- Setup Multi-Tenancy para tabela barbershops
-- Execute via Prisma ou cliente SQL externo

-- 2.1 adicionar coluna se não existir
ALTER TABLE public.barbershops
  ADD COLUMN IF NOT EXISTS tenant_id text;

-- 2.2 backfill (tenant provisório)
UPDATE public.barbershops
SET tenant_id = COALESCE(tenant_id, 'tenant-default');

-- 2.3 tornar NOT NULL
ALTER TABLE public.barbershops
  ALTER COLUMN tenant_id SET NOT NULL;

-- 2.4 garantir coluna name (obrigatória)
ALTER TABLE public.barbershops
  ADD COLUMN IF NOT EXISTS name text;
UPDATE public.barbershops SET name = slug WHERE name IS NULL;
ALTER TABLE public.barbershops
  ALTER COLUMN name SET NOT NULL;

-- 2.5 remover UNIQUE antigo em slug, se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND tablename='barbershops' AND indexname LIKE '%slug_key%'
  ) THEN
    ALTER TABLE public.barbershops DROP CONSTRAINT IF EXISTS barbershops_slug_key;
  END IF;
END$$;

-- 2.6 criar UNIQUE(tenant_id, slug) e índice em tenant_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'barbershops_tenant_slug_key'
  ) THEN
    ALTER TABLE public.barbershops
      ADD CONSTRAINT barbershops_tenant_slug_key UNIQUE (tenant_id, slug);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS barbershops_tenant_idx ON public.barbershops(tenant_id);
