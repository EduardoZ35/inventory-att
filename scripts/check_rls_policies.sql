-- Verificar políticas RLS que pueden bloquear el JOIN

-- 1. Ver si RLS está habilitado en providers
SELECT 'RLS EN PROVIDERS:' as info;
SELECT schemaname, tablename, rowsecurity, CASE WHEN rowsecurity THEN 'HABILITADO' ELSE 'DESHABILITADO' END as estado
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'providers';

-- 2. Ver políticas existentes en providers
SELECT 'POLITICAS EN PROVIDERS:' as info;
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'providers';

-- 3. Ver si RLS está habilitado en purchase_invoices
SELECT 'RLS EN PURCHASE_INVOICES:' as info;
SELECT schemaname, tablename, rowsecurity, CASE WHEN rowsecurity THEN 'HABILITADO' ELSE 'DESHABILITADO' END as estado
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'purchase_invoices';

-- 4. Ver políticas existentes en purchase_invoices
SELECT 'POLITICAS EN PURCHASE_INVOICES:' as info;
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'purchase_invoices';

-- 5. Test directo de acceso a providers
SELECT 'ACCESO DIRECTO A PROVIDERS:' as info;
SELECT COUNT(*) as total_providers, 'providers accesibles' as descripcion
FROM public.providers;




