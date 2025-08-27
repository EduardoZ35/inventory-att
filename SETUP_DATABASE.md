# Configuración de Base de Datos

## Problema: Tablas Faltantes

Si ves errores como "Error desconocido" o "Es posible que la tabla no exista" en las páginas de Clientes, Bodegas o Facturas, es porque estas tablas no existen en tu base de datos de Supabase.

## Solución: Crear las Tablas Necesarias

### Paso 1: Abrir Supabase Dashboard
1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto
4. Ve a la sección "SQL Editor" en el menú lateral

### Paso 2: Ejecutar los Scripts SQL

**IMPORTANTE:** Si ya intentaste ejecutar el script anterior y obtuviste errores, ejecuta PRIMERO el script de corrección.

#### Opción A: Si es tu primera vez (tablas no existen)
1. Copia todo el contenido del archivo `scripts/create_missing_tables.sql`
2. Pégalo en el editor SQL de Supabase
3. Haz clic en "Run" para ejecutar el script

#### Opción B: Si ya tienes tablas pero con errores de columnas
1. **RECOMENDADO - Script Simplificado:** Copia el contenido de `scripts/fix_tables_simple.sql`
2. Pégalo en el editor SQL de Supabase
3. Haz clic en "Run" - esto corregirá todo automáticamente
4. **¡Ya está!** - No necesitas ejecutar más scripts

#### Opción C: Script Avanzado (si el simple no funciona)
1. Copia el contenido de `scripts/fix_existing_tables.sql`
2. Pégalo en el editor SQL de Supabase
3. Haz clic en "Run"
4. **DESPUÉS:** Ejecuta el script principal `scripts/create_missing_tables.sql`

### Paso 3: Verificar que las Tablas se Crearon
1. Ve a la sección "Table Editor" en Supabase
2. Deberías ver las siguientes tablas nuevas:
   - `clients` (clientes)
   - `warehouses` (bodegas) 
   - `invoices` (facturas)
   - `invoice_items` (items de factura)

## ¿Qué Hace el Script?

El script SQL crea:

### Tabla `clients` (Clientes)
- **id**: Identificador único
- **name**: Nombre del cliente
- **email**: Email único del cliente
- **phone**: Teléfono (opcional)
- **address**: Dirección (opcional)
- **created_at/updated_at**: Fechas de creación y actualización

### Tabla `warehouses` (Bodegas)
- **id**: Identificador único
- **name**: Nombre de la bodega
- **location**: Ubicación física
- **capacity**: Capacidad máxima (opcional)
- **created_at/updated_at**: Fechas de creación y actualización

### Tabla `invoices` (Facturas)
- **id**: Identificador único
- **client_id**: Referencia al cliente
- **total**: Monto total de la factura
- **status**: Estado (pending/paid/cancelled)
- **issued_at**: Fecha de emisión
- **due_date**: Fecha de vencimiento
- **paid_at**: Fecha de pago (si aplica)
- **created_at/updated_at**: Fechas de creación y actualización

### Tabla `invoice_items` (Items de Factura)
- **id**: Identificador único
- **invoice_id**: Referencia a la factura
- **product_instance_id**: Referencia al producto (opcional)
- **quantity**: Cantidad
- **unit_price**: Precio unitario
- **total**: Total del item
- **created_at**: Fecha de creación

## Características Adicionales

### Seguridad (Row Level Security)
- Todas las tablas tienen políticas de seguridad habilitadas
- Solo usuarios autenticados pueden crear, editar o eliminar registros
- Todos los usuarios pueden ver los registros

### Actualizaciones Automáticas
- Las columnas `updated_at` se actualizan automáticamente cuando se modifica un registro

### Datos de Ejemplo
- El script incluye algunos registros de ejemplo para probar las funcionalidades

## Después de Ejecutar el Script

Una vez que hayas ejecutado el script en Supabase:

1. Regresa a tu aplicación de inventario
2. Navega a cualquiera de las páginas:
   - 👥 Clientes (`/customers`)
   - 🏢 Bodegas (`/warehouses`) 
   - 💰 Facturas (`/invoices`)
3. Las páginas deberían cargar correctamente y mostrar los datos de ejemplo
4. Podrás crear, editar y eliminar registros normalmente

## Troubleshooting

### Error: "column does not exist" 
Si ves errores como `column "name" of relation "clients" does not exist`:
1. **Esto significa que las tablas existen pero tienen un esquema diferente**
2. **Solución:** Ejecuta `scripts/fix_existing_tables.sql` ANTES del script principal
3. Este script agregará las columnas faltantes sin destruir datos existentes

### Error: "syntax error at or near EXCEPTION"
Si ves errores de sintaxis SQL:
1. **Usa el script simplificado:** `scripts/fix_tables_simple.sql` 
2. **Para solo facturas:** `scripts/fix_invoices_simple.sql`
3. Estos scripts usan sintaxis más simple y compatible

### Si sigues viendo errores:
1. Verifica que tu usuario tiene permisos para crear tablas en Supabase
2. Asegúrate de que las variables de entorno están configuradas correctamente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Revisa la consola del navegador para más detalles del error
4. Verifica en el editor SQL que las tablas tienen las columnas correctas

### Verificar estructura de tablas:
```sql
-- Ver qué columnas tienen las tablas actuales
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('clients', 'warehouses', 'invoices')
ORDER BY table_name, ordinal_position;
```

### Si necesitas recrear las tablas desde cero:
```sql
-- CUIDADO: Esto eliminará todos los datos existentes
DROP TABLE IF EXISTS public.invoice_items CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.warehouses CASCADE;
```
Luego ejecuta el script `create_missing_tables.sql` completo.

## Contacto

Si sigues teniendo problemas, revisa:
1. Los logs de la consola del navegador
2. Los logs de Supabase
3. Que tu plan de Supabase permita crear tablas personalizadas
