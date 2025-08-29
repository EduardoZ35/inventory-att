-- Script para agregar campos de solicitud de autorización a la tabla profiles

-- 1. Agregar campos para manejar solicitudes de autorización
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS auth_request_pending boolean DEFAULT false;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS auth_request_date timestamp with time zone;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS auth_request_processed_at timestamp with time zone;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS auth_request_processed_by uuid REFERENCES auth.users(id);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS auth_request_status text CHECK (auth_request_status IN ('approved', 'rejected', 'pending'));

-- 2. Crear índices para mejorar las consultas
CREATE INDEX IF NOT EXISTS idx_profiles_auth_request_pending ON profiles(auth_request_pending);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_request_date ON profiles(auth_request_date);

-- 3. Actualizar usuarios existentes que no estén autorizados para que puedan solicitar
UPDATE profiles 
SET auth_request_pending = false,
    auth_request_status = 'pending'
WHERE authorized = false AND auth_request_pending IS NULL;

-- 4. Verificar los cambios
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN authorized = true THEN 1 END) as authorized_users,
    COUNT(CASE WHEN auth_request_pending = true THEN 1 END) as pending_requests,
    COUNT(CASE WHEN is_blocked = true THEN 1 END) as blocked_users
FROM profiles;

-- 5. Ver usuarios con solicitudes pendientes
SELECT 
    au.email,
    p.first_name,
    p.last_name,
    p.auth_request_pending,
    p.auth_request_date,
    p.authorized,
    p.is_blocked
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.auth_request_pending = true
ORDER BY p.auth_request_date DESC;

-- 6. Comentarios sobre los nuevos campos:
-- - auth_request_pending: true cuando el usuario ha solicitado autorización
-- - auth_request_date: fecha cuando se hizo la solicitud
-- - auth_request_processed_at: fecha cuando el admin procesó la solicitud
-- - auth_request_processed_by: ID del admin que procesó la solicitud
-- - auth_request_status: estado de la solicitud (approved, rejected, pending)






