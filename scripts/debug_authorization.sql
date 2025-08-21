-- Script para debuggear el sistema de autorización
-- Ejecuta este script para ver el estado actual de todos los usuarios

-- 1. Ver todos los usuarios con su estado de autorización actual
SELECT 
    'ESTADO ACTUAL DE USUARIOS' as info;

SELECT 
    au.email,
    p.first_name,
    p.last_name,
    p.role,
    p.authorized,
    p.is_blocked,
    p.authorized_at,
    p.authorized_by,
    au.created_at as user_created_at
FROM profiles p
FULL OUTER JOIN auth.users au ON p.id = au.id
ORDER BY au.email;

-- 2. Verificar si existen las columnas de autorización
SELECT 
    'VERIFICAR COLUMNAS DE AUTORIZACIÓN' as info;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('authorized', 'authorized_at', 'authorized_by')
ORDER BY column_name;

-- 3. Contar usuarios por estado
SELECT 
    'ESTADÍSTICAS DE AUTORIZACIÓN' as info;

SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN authorized = true THEN 1 END) as usuarios_autorizados,
    COUNT(CASE WHEN authorized = false THEN 1 END) as usuarios_no_autorizados,
    COUNT(CASE WHEN authorized IS NULL THEN 1 END) as usuarios_sin_estado
FROM profiles;

-- 4. Verificar usuarios específicos que mencionaste
SELECT 
    'USUARIOS ESPECÍFICOS' as info;

SELECT 
    au.email,
    p.authorized,
    p.is_blocked,
    p.role,
    p.authorized_at,
    'Estado en auth.users' as source
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email IN ('ezuniga@rflex.cl', 'relojes@rflex.cl')
ORDER BY au.email;

-- 5. Si las columnas no existen, este comando te lo dirá
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'authorized'
        ) 
        THEN '✅ Columna authorized existe' 
        ELSE '❌ Columna authorized NO existe - necesitas ejecutar add_authorization_system.sql'
    END as status_authorized,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'authorized_at'
        ) 
        THEN '✅ Columna authorized_at existe' 
        ELSE '❌ Columna authorized_at NO existe'
    END as status_authorized_at;
