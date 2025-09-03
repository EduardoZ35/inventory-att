# Migración de Base de Datos - Nuevas Columnas de Ubicación

## Problema
El error "Could not find the 'city' column of 'providers' in the schema cache" indica que las nuevas columnas de ubicación no existen en la base de datos.

## Solución
Ejecutar el script de migración para agregar las nuevas columnas a las tablas `clients` y `providers`.

## Pasos para Ejecutar la Migración

### Opción 1: Usando el SQL Editor de Supabase

1. **Acceder a Supabase Dashboard**
   - Ve a [supabase.com](https://supabase.com)
   - Inicia sesión en tu cuenta
   - Selecciona tu proyecto

2. **Abrir SQL Editor**
   - En el panel izquierdo, haz clic en "SQL Editor"
   - Haz clic en "New query"

3. **Ejecutar el Script**
   - Copia y pega el contenido del archivo `database_migration.sql`
   - Haz clic en "Run" para ejecutar el script

### Opción 2: Usando la Consola de Supabase

1. **Acceder a la Consola**
   - Ve a tu proyecto en Supabase
   - Haz clic en "Table Editor" en el panel izquierdo

2. **Modificar las Tablas**
   - Selecciona la tabla `clients`
   - Haz clic en "Add column" para cada nueva columna:
     - `country` (TEXT)
     - `region_id` (TEXT)
     - `region_name` (TEXT)
     - `commune_id` (TEXT)
     - `commune_name` (TEXT)
   - Repite el proceso para la tabla `providers`

## Columnas que se Agregarán

### Tabla `clients`:
- `country` (TEXT) - País seleccionado
- `region_id` (TEXT) - ID de la región
- `region_name` (TEXT) - Nombre de la región
- `commune_id` (TEXT) - ID de la comuna
- `commune_name` (TEXT) - Nombre de la comuna

### Tabla `providers`:
- `country` (TEXT) - País seleccionado
- `region_id` (TEXT) - ID de la región
- `region_name` (TEXT) - Nombre de la región
- `commune_id` (TEXT) - ID de la comuna
- `commune_name` (TEXT) - Nombre de la comuna

## Verificación

Después de ejecutar la migración, puedes verificar que las columnas se agregaron correctamente:

```sql
-- Verificar columnas de la tabla clients
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- Verificar columnas de la tabla providers
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'providers' 
ORDER BY ordinal_position;
```

## Notas Importantes

- **Backup**: Antes de ejecutar la migración, es recomendable hacer un backup de tu base de datos
- **Downtime**: Esta migración no requiere downtime ya que solo agrega columnas
- **Datos Existentes**: Las nuevas columnas se crearán con valores NULL para registros existentes
- **Compatibilidad**: El script usa `IF NOT EXISTS` para evitar errores si las columnas ya existen

## Después de la Migración

Una vez ejecutada la migración:

1. **Reiniciar la aplicación** si es necesario
2. **Probar los formularios** de clientes y proveedores
3. **Verificar** que el selector de ubicación funcione correctamente
4. **Comprobar** que los datos se guarden correctamente en las nuevas columnas

## Soporte

Si encuentras algún problema durante la migración:

1. Verifica que tienes permisos de administrador en la base de datos
2. Revisa los logs de Supabase para errores específicos
3. Asegúrate de que el script se ejecute completamente
4. Contacta al equipo de desarrollo si persisten los problemas
