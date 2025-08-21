-- Script para corregir el problema de autorización
-- Este script autoriza tu usuario y revoca acceso a usuarios no autorizados

-- 1. Asegurar que ezuniga@rflex.cl esté autorizado
UPDATE profiles 
SET authorized = true, 
    authorized_at = NOW(), 
    authorized_by = (SELECT id FROM auth.users WHERE email = 'ezuniga@rflex.cl' LIMIT 1)
WHERE id = (SELECT id FROM auth.users WHERE email = 'ezuniga@rflex.cl' LIMIT 1);

-- 2. Desautorizar explícitamente a relojes@rflex.cl (para testing)
UPDATE profiles 
SET authorized = false, 
    authorized_at = NULL, 
    authorized_by = NULL
WHERE id = (SELECT id FROM auth.users WHERE email = 'relojes@rflex.cl' LIMIT 1);

-- 3. Verificar los cambios
SELECT 
    'DESPUÉS DE LA CORRECCIÓN' as info;

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
        WHEN p.authorized = false THEN '❌ ACCESO DENEGADO'
        WHEN p.authorized IS NULL THEN '⚠️ SIN ESTADO'
        ELSE '❓ DESCONOCIDO'
    END as estado_acceso
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE au.email IN ('ezuniga@rflex.cl', 'relojes@rflex.cl')
ORDER BY au.email;

-- 4. Mostrar instrucciones
SELECT 
    '🔧 INSTRUCCIONES' as info,
    'Después de ejecutar este script, cierra todas las sesiones y prueba el acceso nuevamente' as instruccion;

-- 5. Comando para verificar que el middleware funciona
SELECT 
    '🧪 PARA PROBAR' as info,
    'El usuario relojes@rflex.cl debería ser redirigido a /unauthorized' as test_esperado,
    'El usuario ezuniga@rflex.cl debería poder acceder normalmente' as test_admin;
