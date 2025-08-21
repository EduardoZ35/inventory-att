-- Script para verificar el estado de bloqueo en tiempo real
-- Ejecutar DESPUÉS de intentar bloquear un usuario

-- 1. Ver el estado actual de todos los usuarios con sus campos de bloqueo
SELECT 
  id,
  first_name,
  last_name, 
  role,
  is_blocked,
  blocked_at,
  blocked_by,
  blocked_reason,
  created_at,
  updated_at
FROM profiles 
ORDER BY updated_at DESC;

-- 2. Verificar específicamente el usuario que intentaste bloquear
-- Reemplaza 'relojes@rflex.cl' con el email del usuario que estás bloqueando
SELECT 
  p.id,
  p.first_name,
  p.last_name, 
  p.role,
  p.is_blocked,
  p.blocked_at,
  p.blocked_by,
  p.blocked_reason,
  au.email
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.email = 'relojes@rflex.cl';

-- 3. Contar usuarios por estado
SELECT 
  'Total usuarios' as categoria,
  COUNT(*) as cantidad
FROM profiles
UNION ALL
SELECT 
  'Usuarios bloqueados',
  COUNT(*)
FROM profiles 
WHERE is_blocked = true
UNION ALL
SELECT 
  'Usuarios activos',
  COUNT(*)
FROM profiles 
WHERE is_blocked = false OR is_blocked IS NULL;
