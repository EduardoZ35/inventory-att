-- Arreglar permisos RLS para que el frontend pueda acceder a los datos

-- 1. Ver estado actual de RLS
SELECT 'ESTADO RLS ACTUAL:' as info;
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE WHEN rowsecurity THEN 'RLS HABILITADO' ELSE 'RLS DESHABILITADO' END as estado
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('providers', 'purchase_invoices')
ORDER BY tablename;

-- 2. Ver políticas existentes
SELECT 'POLITICAS EXISTENTES:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('providers', 'purchase_invoices')
ORDER BY tablename, policyname;

-- 3. Crear políticas permisivas para providers si no existen
DROP POLICY IF EXISTS "providers_select_policy" ON public.providers;
CREATE POLICY "providers_select_policy" 
ON public.providers FOR SELECT 
TO authenticated, anon
USING (true);

-- 4. Crear políticas permisivas para purchase_invoices si no existen
DROP POLICY IF EXISTS "purchase_invoices_select_policy" ON public.purchase_invoices;
CREATE POLICY "purchase_invoices_select_policy" 
ON public.purchase_invoices FOR SELECT 
TO authenticated, anon
USING (true);

-- 5. Asegurar que RLS esté habilitado pero con políticas permisivas
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_invoices ENABLE ROW LEVEL SECURITY;

-- 6. Test de acceso directo desde perspectiva de usuario autenticado
SELECT 'TEST ACCESO PROVIDERS:' as info;
SELECT COUNT(*) as total_providers FROM public.providers;

SELECT 'TEST ACCESO PURCHASE_INVOICES:' as info;
SELECT COUNT(*) as total_invoices FROM public.purchase_invoices;

-- 7. Test del JOIN desde perspectiva de usuario autenticado
SELECT 'TEST JOIN FINAL:' as info;
SELECT 
    pi.id,
    pi.invoice_number,
    pi.provider_id,
    p.name as provider_name
FROM public.purchase_invoices pi
LEFT JOIN public.providers p ON pi.provider_id = p.id
LIMIT 3;

