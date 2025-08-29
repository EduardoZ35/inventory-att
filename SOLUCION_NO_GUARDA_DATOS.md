# Solución: Los Datos No Se Guardan en la Base de Datos

## Problema Identificado

Los formularios no están guardando datos en Supabase. Esto puede deberse a:

1. **Políticas de seguridad (RLS) no configuradas**
2. **Estructura de tablas incorrecta**
3. **Permisos de usuario insuficientes**
4. **Errores en las consultas SQL**

## Solución Paso a Paso

### Paso 1: Verificar la Estructura de las Tablas

Ejecuta el script `verificar_tablas.sql` en Supabase SQL Editor para verificar:

```sql
-- Verificar estructura de la tabla clients
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- Verificar estructura de la tabla providers
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'providers' 
ORDER BY ordinal_position;
```

**Verifica que las columnas existan:**
- `id` (uuid, primary key)
- `name` / `organization` (text)
- `email` / `contact_email` (text)
- `phone` / `contact_phone` (text)
- `address` (text)
- `country` (text)
- `region_id` (text)
- `region_name` (text)
- `commune_id` (text)
- `commune_name` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Paso 2: Configurar Políticas de Seguridad

Ejecuta el script `configurar_politicas.sql` en Supabase SQL Editor:

```sql
-- Habilitar RLS en las tablas
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Crear políticas para clients
CREATE POLICY "Users can insert clients" ON clients
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view clients" ON clients
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update clients" ON clients
FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete clients" ON clients
FOR DELETE USING (auth.role() = 'authenticated');

-- Crear políticas para providers
CREATE POLICY "Users can insert providers" ON providers
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view providers" ON providers
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update providers" ON providers
FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete providers" ON providers
FOR DELETE USING (auth.role() = 'authenticated');
```

### Paso 3: Verificar la Autenticación

1. **Asegúrate de estar autenticado** en la aplicación
2. **Verifica que el usuario tenga permisos** en Supabase
3. **Revisa la consola del navegador** para errores de autenticación

### Paso 4: Probar con Datos Simples

Ejecuta esta consulta de prueba en Supabase SQL Editor:

```sql
-- Insertar un cliente de prueba
INSERT INTO clients (name, email, phone, address, country, region_id, region_name, commune_id, commune_name)
VALUES ('Cliente Prueba', 'test@test.com', '+56912345678', 'Dirección Test', 'Chile', 'CL-13', 'Región Metropolitana', '13101', 'Santiago');

-- Verificar que se insertó
SELECT * FROM clients WHERE name = 'Cliente Prueba';

-- Insertar un proveedor de prueba
INSERT INTO providers (organization, dni, contact_name, contact_email, contact_phone, address, country, region_id, region_name, commune_id, commune_name)
VALUES ('Empresa Prueba', '12.345.678-9', 'Contacto Test', 'contacto@test.com', '+56912345678', 'Dirección Test', 'Chile', 'CL-13', 'Región Metropolitana', '13101', 'Santiago');

-- Verificar que se insertó
SELECT * FROM providers WHERE organization = 'Empresa Prueba';
```

### Paso 5: Debuggear en el Navegador

1. **Abre las herramientas de desarrollador** (F12)
2. **Ve a la pestaña Console**
3. **Intenta agregar un cliente o proveedor**
4. **Revisa los logs** que agregamos al código:
   - "Datos a insertar: ..."
   - "Datos procesados: ..."
   - "Error de Supabase: ..." (si hay error)
   - "Cliente/Proveedor insertado exitosamente: ..."

### Paso 6: Verificar Variables de Entorno

Asegúrate de que las variables de entorno estén configuradas correctamente:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

## Posibles Errores y Soluciones

### Error: "new row violates row-level security policy"
**Solución:** Ejecuta el script de políticas de seguridad.

### Error: "column does not exist"
**Solución:** Ejecuta la migración de base de datos.

### Error: "permission denied"
**Solución:** Verifica que el usuario esté autenticado y tenga permisos.

### Error: "duplicate key value violates unique constraint"
**Solución:** Verifica que no estés intentando insertar un registro duplicado.

## Verificación Final

Después de seguir todos los pasos:

1. **Reinicia la aplicación**
2. **Inicia sesión** en la aplicación
3. **Intenta agregar un cliente** con datos completos
4. **Verifica en Supabase** que el registro aparezca en la tabla
5. **Intenta editar** el cliente agregado
6. **Verifica que los cambios** se guarden correctamente

## Logs de Debug

Los logs agregados al código te ayudarán a identificar exactamente dónde está el problema:

- **Si no ves logs:** El formulario no se está enviando
- **Si ves "Datos a insertar" pero no "insertado exitosamente":** Hay un error en la consulta
- **Si ves "Error de Supabase":** El error específico te dirá qué está mal

## Soporte

Si el problema persiste después de seguir todos los pasos:

1. **Comparte los logs** de la consola del navegador
2. **Comparte el resultado** de las consultas de verificación
3. **Verifica que todos los scripts** se ejecutaron correctamente
