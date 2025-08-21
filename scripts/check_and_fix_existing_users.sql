-- Script para verificar y arreglar usuarios existentes
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar el estado actual de los usuarios
SELECT id, first_name, last_name, role, is_blocked, blocked_at, blocked_by, blocked_reason
FROM profiles 
ORDER BY first_name, last_name;

-- 2. Actualizar usuarios existentes que tienen is_blocked = NULL a FALSE
UPDATE profiles 
SET is_blocked = FALSE 
WHERE is_blocked IS NULL;

-- 3. Verificar después de la actualización
SELECT id, first_name, last_name, role, is_blocked, blocked_at, blocked_by, blocked_reason
FROM profiles 
ORDER BY first_name, last_name;

-- 4. Verificar que todos los usuarios tengan is_blocked definido
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN is_blocked = true THEN 1 END) as usuarios_bloqueados,
  COUNT(CASE WHEN is_blocked = false THEN 1 END) as usuarios_activos,
  COUNT(CASE WHEN is_blocked IS NULL THEN 1 END) as usuarios_sin_estado
FROM profiles;
