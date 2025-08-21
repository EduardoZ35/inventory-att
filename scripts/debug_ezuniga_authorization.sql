-- Script para debuggear específicamente el usuario ezuniga@rflex.cl

-- 1. Verificar que el usuario existe en auth.users
SELECT 
    'USUARIO EN AUTH.USERS' as info;

SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'ezuniga@rflex.cl';

-- 2. Verificar que el perfil existe en profiles
SELECT 
    'PERFIL EN PROFILES' as info;

SELECT 
    id,
    first_name,
    last_name,
    role,
    authorized,
    is_blocked,
    authorized_at,
    authorized_by
FROM profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'ezuniga@rflex.cl' LIMIT 1);

-- 3. Verificar la consulta EXACTA que hace la aplicación
SELECT 
    'CONSULTA EXACTA DE LA APLICACIÓN' as info;

SELECT 
    authorized, 
    is_blocked, 
    role
FROM profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'ezuniga@rflex.cl' LIMIT 1);

-- 4. Verificar tipos de datos
SELECT 
    'TIPOS DE DATOS' as info;

SELECT 
    pg_typeof(authorized) as tipo_authorized,
    pg_typeof(is_blocked) as tipo_is_blocked,
    pg_typeof(role) as tipo_role,
    authorized,
    is_blocked,
    role
FROM profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'ezuniga@rflex.cl' LIMIT 1);

-- 5. FORZAR la actualización una vez más
UPDATE profiles 
SET 
    authorized = true,
    is_blocked = false,
    role = 'admin',
    authorized_at = NOW(),
    authorized_by = (SELECT id FROM auth.users WHERE email = 'ezuniga@rflex.cl' LIMIT 1)
WHERE id = (SELECT id FROM auth.users WHERE email = 'ezuniga@rflex.cl' LIMIT 1);

-- 6. Verificar después de la actualización forzada
SELECT 
    'DESPUÉS DE ACTUALIZACIÓN FORZADA' as info;

SELECT 
    au.email,
    p.authorized,
    p.is_blocked,
    p.role,
    p.authorized_at,
    CASE 
        WHEN p.authorized IS NULL THEN '❌ AUTHORIZED ES NULL'
        WHEN p.authorized = false THEN '❌ AUTHORIZED ES FALSE'
        WHEN p.authorized = true THEN '✅ AUTHORIZED ES TRUE'
        ELSE '❓ AUTHORIZED VALOR DESCONOCIDO'
    END as estado_authorized,
    CASE 
        WHEN p.is_blocked IS NULL THEN '❓ IS_BLOCKED ES NULL'
        WHEN p.is_blocked = false THEN '✅ IS_BLOCKED ES FALSE'
        WHEN p.is_blocked = true THEN '❌ IS_BLOCKED ES TRUE'
        ELSE '❓ IS_BLOCKED VALOR DESCONOCIDO'
    END as estado_blocked
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE au.email = 'ezuniga@rflex.cl';

-- 7. Verificar que no haya duplicados
SELECT 
    'VERIFICAR DUPLICADOS' as info;

SELECT 
    COUNT(*) as total_perfiles_ezuniga
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE au.email = 'ezuniga@rflex.cl';

-- 8. Si hay duplicados, mostrarlos
SELECT 
    'PERFILES DUPLICADOS (SI LOS HAY)' as info;

SELECT 
    p.id,
    au.email,
    p.authorized,
    p.is_blocked,
    p.role,
    p.created_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE au.email = 'ezuniga@rflex.cl';
