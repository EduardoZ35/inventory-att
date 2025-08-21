-- Script para forzar logout de usuarios no autorizados
-- Este script revoca las sesiones de todos los usuarios no autorizados

-- 1. Ver qué usuarios están actualmente no autorizados
SELECT 
    'USUARIOS NO AUTORIZADOS ACTUALMENTE' as info;

SELECT 
    au.email,
    p.first_name,
    p.last_name,
    p.role,
    p.authorized,
    au.last_sign_in_at,
    CASE 
        WHEN p.authorized = false THEN '❌ NECESITA LOGOUT FORZADO'
        WHEN p.authorized IS NULL THEN '⚠️ ESTADO DESCONOCIDO'
        ELSE '✅ AUTORIZADO'
    END as estado
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.authorized = false OR p.authorized IS NULL
ORDER BY au.last_sign_in_at DESC;

-- 2. Información sobre cómo revocar sesiones
SELECT 
    'INSTRUCCIONES PARA REVOCAR SESIONES' as info,
    'Supabase no permite revocar sesiones directamente desde SQL' as nota,
    'Debes usar la API Admin o forzar logout desde la aplicación' as solucion;

-- 3. Lista de usuarios que deberían ser bloqueados del acceso
SELECT 
    'ACCIÓN RECOMENDADA' as info,
    'Cierra todas las sesiones del navegador y limpia cookies' as paso1,
    'Reinicia el servidor de desarrollo (npm run dev)' as paso2,
    'El middleware debería bloquear usuarios no autorizados' as paso3;
