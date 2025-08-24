-- Script para crear la función get_user_role() que falta en la base de datos
-- Esta función es necesaria para que funcione la página de administración de usuarios

-- 1. Crear la función get_user_role()
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  -- Obtener el usuario actual autenticado
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Buscar el rol del usuario en la tabla profiles
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  -- Retornar el rol encontrado
  RETURN user_role;
END;
$$;

-- 2. Dar permisos para que los usuarios autenticados puedan ejecutar la función
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;

-- 3. Verificar que la función funciona correctamente
-- (Esta parte es solo para pruebas - comentada para producción)
/*
SELECT 
  au.email,
  p.role,
  get_user_role() as function_result
FROM auth.users au
JOIN profiles p ON au.id = p.id
WHERE au.id = auth.uid();
*/

-- 4. Comentarios:
-- - Esta función obtiene el rol del usuario autenticado actual
-- - Se usa en las páginas de administración para verificar permisos
-- - Requiere que el usuario esté autenticado (auth.uid() no sea NULL)
-- - Devuelve NULL si no hay usuario autenticado o no tiene perfil
