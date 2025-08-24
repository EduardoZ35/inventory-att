-- Script para configurar tu usuario como administrador
-- IMPORTANTE: Reemplaza 'tu-email@example.com' con tu email real

-- 1. Verificar si tu usuario existe en auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE email = 'ezuniga@rflex.cl';

-- 2. Verificar si tu perfil existe en profiles
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.role,
    p.is_blocked,
    p.authorized,
    au.email
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.email = 'ezuniga@rflex.cl';

-- 3. Si no existe el perfil, crearlo (ejecutar solo si es necesario)
-- DESCOMENTA y ejecuta si no tienes perfil:
/*
INSERT INTO profiles (id, first_name, last_name, role, is_blocked, authorized, authorized_at)
SELECT 
    id,
    'Eduardo',
    'Zuñiga',
    'admin',
    false,
    true,
    NOW()
FROM auth.users 
WHERE email = 'ezuniga@rflex.cl'
ON CONFLICT (id) DO NOTHING;
*/

-- 4. Si existe el perfil pero no es admin, actualizarlo
UPDATE profiles 
SET 
    role = 'admin',
    is_blocked = false,
    authorized = true,
    authorized_at = NOW(),
    authorized_by = (SELECT id FROM auth.users WHERE email = 'ezuniga@rflex.cl' LIMIT 1)
WHERE id = (SELECT id FROM auth.users WHERE email = 'ezuniga@rflex.cl' LIMIT 1);

-- 5. Verificar que todo está correcto
SELECT 
    au.email,
    p.first_name,
    p.last_name,
    p.role,
    p.is_blocked,
    p.authorized,
    p.authorized_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE au.email = 'ezuniga@rflex.cl';

-- 6. Verificar que la función get_user_role funciona
-- (Esto solo funcionará si ejecutas como el usuario ezuniga@rflex.cl)
-- SELECT get_user_role();

-- 7. Verificar todos los usuarios del sistema
SELECT 
    au.email,
    p.first_name,
    p.last_name,
    p.role,
    p.is_blocked,
    p.authorized
FROM profiles p
JOIN auth.users au ON p.id = au.id
ORDER BY p.role DESC, au.email;
