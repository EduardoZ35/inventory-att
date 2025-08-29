-- Script de migración para agregar columnas de ubicación
-- Ejecutar este script en la base de datos Supabase

-- Agregar columnas a la tabla 'clients'
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS region_id TEXT,
ADD COLUMN IF NOT EXISTS region_name TEXT,
ADD COLUMN IF NOT EXISTS commune_id TEXT,
ADD COLUMN IF NOT EXISTS commune_name TEXT;

-- Agregar columnas a la tabla 'providers'
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS region_id TEXT,
ADD COLUMN IF NOT EXISTS region_name TEXT,
ADD COLUMN IF NOT EXISTS commune_id TEXT,
ADD COLUMN IF NOT EXISTS commune_name TEXT;

-- Verificar que las columnas se agregaron correctamente
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'clients' 
-- ORDER BY ordinal_position;

-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'providers' 
-- ORDER BY ordinal_position;
