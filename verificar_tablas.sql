-- Script para verificar la estructura de las tablas y políticas
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura de la tabla clients
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- 2. Verificar estructura de la tabla providers
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'providers' 
ORDER BY ordinal_position;

-- 3. Verificar políticas de seguridad para clients
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'clients';

-- 4. Verificar políticas de seguridad para providers
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'providers';

-- 5. Verificar permisos de usuario actual
SELECT 
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name IN ('clients', 'providers')
AND grantee = current_user;

-- 6. Verificar si las tablas tienen RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('clients', 'providers');
