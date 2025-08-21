-- Script para agregar sistema de autorización (whitelist)
-- Este script agrega los campos necesarios para controlar qué usuarios pueden acceder

-- 1. Agregar campo 'authorized' a la tabla profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS authorized boolean DEFAULT false;

-- 2. Agregar campos de auditoría para la autorización
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS authorized_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS authorized_by uuid REFERENCES auth.users(id);

-- 3. Crear índice para mejorar las consultas de autorización
CREATE INDEX IF NOT EXISTS idx_profiles_authorized ON profiles(authorized);

-- 4. Autorizar tu usuario actual (reemplaza 'tu-email@rflex.cl' con tu email real)
-- IMPORTANTE: Cambia este email por tu email real antes de ejecutar
UPDATE profiles 
SET authorized = true, 
    authorized_at = NOW(), 
    authorized_by = (SELECT id FROM auth.users WHERE email = 'ezuniga@rflex.cl' LIMIT 1)
WHERE id = (SELECT id FROM auth.users WHERE email = 'ezuniga@rflex.cl' LIMIT 1);

-- 5. Verificar que tu usuario está autorizado
SELECT 
    au.email,
    p.first_name,
    p.last_name,
    p.role,
    p.authorized,
    p.authorized_at,
    (SELECT au2.email FROM auth.users au2 WHERE au2.id = p.authorized_by) as authorized_by_email
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE au.email = 'ezuniga@rflex.cl';

-- 6. Ver todos los usuarios y su estado de autorización
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
ORDER BY p.authorized DESC, au.email;

-- 7. Comentarios importantes:
-- - Solo los usuarios con authorized = true podrán acceder al sistema
-- - Los administradores podrán autorizar nuevos usuarios desde la interfaz
-- - El campo authorized_by registra quién autorizó al usuario
-- - El campo authorized_at registra cuándo fue autorizado
