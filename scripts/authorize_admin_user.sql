-- Script para autorizar específicamente al usuario admin
-- Esto asegura que ezuniga@rflex.cl tenga acceso completo

-- 1. Verificar el estado actual de ezuniga@rflex.cl
SELECT 
    'ESTADO ACTUAL DE EZUNIGA' as info;

SELECT 
    au.email,
    p.first_name,
    p.last_name,
    p.role,
    p.authorized,
    p.is_blocked,
    p.authorized_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE au.email = 'ezuniga@rflex.cl';

-- 2. Autorizar explícitamente a ezuniga@rflex.cl
UPDATE profiles 
SET authorized = true, 
    authorized_at = NOW(), 
    authorized_by = (SELECT id FROM auth.users WHERE email = 'ezuniga@rflex.cl' LIMIT 1),
    is_blocked = false,
    role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'ezuniga@rflex.cl' LIMIT 1);

-- 3. Verificar que el cambio se aplicó correctamente
SELECT 
    'DESPUÉS DE AUTORIZAR EZUNIGA' as info;

SELECT 
    au.email,
    p.first_name,
    p.last_name,
    p.role,
    p.authorized,
    p.is_blocked,
    p.authorized_at,
    CASE 
        WHEN p.authorized = true THEN '✅ PUEDE ACCEDER'
        ELSE '❌ ACCESO DENEGADO'
    END as estado_acceso
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE au.email = 'ezuniga@rflex.cl';

-- 4. Ver el estado de todos los usuarios
SELECT 
    'RESUMEN DE TODOS LOS USUARIOS' as info;

SELECT 
    au.email,
    p.role,
    p.authorized,
    p.is_blocked,
    CASE 
        WHEN p.authorized = true AND p.is_blocked = false THEN '✅ ACCESO PERMITIDO'
        WHEN p.authorized = false THEN '❌ NO AUTORIZADO'
        WHEN p.is_blocked = true THEN '🔒 BLOQUEADO'
        ELSE '❓ ESTADO DESCONOCIDO'
    END as estado_final
FROM profiles p
JOIN auth.users au ON p.id = au.id
ORDER BY p.authorized DESC, au.email;
