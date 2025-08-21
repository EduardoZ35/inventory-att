-- Script SIMPLIFICADO para agregar columnas de bloqueo de usuarios
-- Ejecutar en el SQL Editor de Supabase

-- 1. Agregar columna is_blocked (boolean, por defecto false)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- 2. Agregar columna blocked_at (timestamp, cuando fue bloqueado)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ NULL;

-- 3. Agregar columna blocked_by (referencia al admin que bloqueó)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS blocked_by UUID NULL;

-- 4. Agregar columna blocked_reason (razón del bloqueo)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS blocked_reason TEXT NULL;

-- 5. Agregar índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_is_blocked ON profiles(is_blocked);
CREATE INDEX IF NOT EXISTS idx_profiles_blocked_at ON profiles(blocked_at);

-- 6. Agregar comentarios para documentación
COMMENT ON COLUMN profiles.is_blocked IS 'Indica si el usuario está bloqueado';
COMMENT ON COLUMN profiles.blocked_at IS 'Fecha y hora cuando el usuario fue bloqueado';
COMMENT ON COLUMN profiles.blocked_by IS 'ID del admin que bloqueó al usuario';
COMMENT ON COLUMN profiles.blocked_reason IS 'Razón por la cual fue bloqueado el usuario';

-- 7. Actualizar usuarios que ya tienen role 'blocked' para que tengan is_blocked = true
UPDATE profiles 
SET is_blocked = TRUE, 
    blocked_at = NOW()
WHERE role = 'blocked' AND is_blocked = FALSE;

-- 8. Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('is_blocked', 'blocked_at', 'blocked_by', 'blocked_reason')
ORDER BY column_name;
