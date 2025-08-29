-- Script para configurar políticas de seguridad
-- Ejecutar en Supabase SQL Editor

-- 1. Habilitar RLS en las tablas
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- 2. Crear políticas para la tabla clients
-- Política para INSERT (insertar)
CREATE POLICY "Users can insert clients" ON clients
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para SELECT (leer)
CREATE POLICY "Users can view clients" ON clients
FOR SELECT USING (auth.role() = 'authenticated');

-- Política para UPDATE (actualizar)
CREATE POLICY "Users can update clients" ON clients
FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Política para DELETE (eliminar)
CREATE POLICY "Users can delete clients" ON clients
FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Crear políticas para la tabla providers
-- Política para INSERT (insertar)
CREATE POLICY "Users can insert providers" ON providers
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para SELECT (leer)
CREATE POLICY "Users can view providers" ON providers
FOR SELECT USING (auth.role() = 'authenticated');

-- Política para UPDATE (actualizar)
CREATE POLICY "Users can update providers" ON providers
FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Política para DELETE (eliminar)
CREATE POLICY "Users can delete providers" ON providers
FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Verificar que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('clients', 'providers')
ORDER BY tablename, cmd;
