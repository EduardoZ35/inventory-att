-- Arreglar políticas RLS para la tabla warehouses

-- 1. Ver estado actual de RLS en warehouses
SELECT 'ESTADO RLS WAREHOUSES:' as info;
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE WHEN rowsecurity THEN 'RLS HABILITADO' ELSE 'RLS DESHABILITADO' END as estado
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'warehouses';

-- 2. Ver políticas existentes en warehouses
SELECT 'POLITICAS EXISTENTES EN WAREHOUSES:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'warehouses'
ORDER BY policyname;

-- 3. Crear políticas permisivas para warehouses
-- Política para SELECT (leer)
DROP POLICY IF EXISTS "warehouses_select_policy" ON public.warehouses;
CREATE POLICY "warehouses_select_policy" 
ON public.warehouses FOR SELECT 
TO authenticated, anon
USING (true);

-- Política para INSERT (crear)
DROP POLICY IF EXISTS "warehouses_insert_policy" ON public.warehouses;
CREATE POLICY "warehouses_insert_policy" 
ON public.warehouses FOR INSERT 
TO authenticated, anon
WITH CHECK (true);

-- Política para UPDATE (actualizar)
DROP POLICY IF EXISTS "warehouses_update_policy" ON public.warehouses;
CREATE POLICY "warehouses_update_policy" 
ON public.warehouses FOR UPDATE 
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Política para DELETE (eliminar)
DROP POLICY IF EXISTS "warehouses_delete_policy" ON public.warehouses;
CREATE POLICY "warehouses_delete_policy" 
ON public.warehouses FOR DELETE 
TO authenticated, anon
USING (true);

-- 4. Asegurar que RLS esté habilitado pero con políticas permisivas
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;

-- 5. Verificar que las políticas se crearon correctamente
SELECT 'POLITICAS CREADAS:' as info;
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'warehouses'
ORDER BY policyname;

-- 6. Test de acceso
SELECT 'TEST ACCESO WAREHOUSES:' as info;
SELECT COUNT(*) as total_warehouses FROM public.warehouses;

-- 7. Test de INSERT
SELECT 'TEST INSERT:' as info;
-- Este es solo un test, no insertará realmente
SELECT 'Políticas configuradas para permitir INSERT' as resultado;




