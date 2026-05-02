-- ============================================================
-- Migração 005 — Corrige RLS de requisitions e audit_logs
-- Aplicar em: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Garante coluna estimated_cost (caso não exista no schema real)
ALTER TABLE public.requisitions
  ADD COLUMN IF NOT EXISTS estimated_cost numeric;

-- 2. Remove TODAS as políticas de INSERT existentes em requisitions
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'requisitions' AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.requisitions', pol.policyname);
  END LOOP;
END$$;

-- 3. Cria política de INSERT permissiva para qualquer usuário autenticado
CREATE POLICY requisitions_insert_authenticated
  ON public.requisitions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Garante RLS ativo em audit_logs
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Remove políticas de INSERT existentes em audit_logs
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'audit_logs' AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.audit_logs', pol.policyname);
  END LOOP;
END$$;

-- 6. Cria política de INSERT permissiva em audit_logs
CREATE POLICY audit_logs_insert_authenticated
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 7. SELECT em audit_logs para usuários autenticados (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'audit_logs' AND cmd = 'SELECT'
  ) THEN
    CREATE POLICY audit_logs_select_authenticated
      ON public.audit_logs
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END$$;
