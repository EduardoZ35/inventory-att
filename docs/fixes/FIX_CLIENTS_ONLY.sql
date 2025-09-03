-- =============================================================================
-- SCRIPT PARA CORREGIR SOLO LA TABLA CLIENTS
-- =============================================================================
-- Este script corrige específicamente la tabla clients que ya existe

-- Primero, vamos a ver qué columnas tiene la tabla clients actual
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    -- Verificar si clients existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        
        -- Agregar columnas que necesitamos si no existen
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'client_type') THEN
            ALTER TABLE clients ADD COLUMN client_type TEXT DEFAULT 'attendance_company';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'contact_person') THEN
            ALTER TABLE clients ADD COLUMN contact_person TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'service_level') THEN
            ALTER TABLE clients ADD COLUMN service_level TEXT DEFAULT 'standard';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'phone') THEN
            ALTER TABLE clients ADD COLUMN phone TEXT;
        END IF;
        
        -- Si la columna organization existe y es NOT NULL, la hacemos nullable
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'organization') THEN
            ALTER TABLE clients ALTER COLUMN organization DROP NOT NULL;
        END IF;
        
        -- Verificar si la tabla está vacía para insertar datos de ejemplo
        SELECT COUNT(*) INTO col_count FROM clients;
        
        IF col_count = 0 THEN
            -- La tabla está vacía, intentar insertar datos con todas las columnas posibles
            BEGIN
                INSERT INTO clients (name, email, phone, client_type, contact_person, service_level, organization) VALUES
                ('Empresa Construcciones ABC', 'contacto@construccionesabc.cl', '+56912345001', 'attendance_company', 'Juan Pérez', 'standard', 'Empresa Construcciones ABC'),
                ('Casino Marina del Sol', 'it@marinadelsol.cl', '+56912345002', 'casino_corporate', 'María González', 'premium', 'Casino Marina del Sol'),
                ('Área RRHH Corporativo', 'rrhh@empresa.cl', '+56912345003', 'internal_area', 'Carlos Rodríguez', 'enterprise', 'Área RRHH Corporativo');
            EXCEPTION
                WHEN others THEN
                    -- Si falla con organization, intentar sin ella
                    BEGIN
                        INSERT INTO clients (name, email, phone, client_type, contact_person, service_level) VALUES
                        ('Empresa Construcciones ABC', 'contacto@construccionesabc.cl', '+56912345001', 'attendance_company', 'Juan Pérez', 'standard'),
                        ('Casino Marina del Sol', 'it@marinadelsol.cl', '+56912345002', 'casino_corporate', 'María González', 'premium'),
                        ('Área RRHH Corporativo', 'rrhh@empresa.cl', '+56912345003', 'internal_area', 'Carlos Rodríguez', 'enterprise');
                    EXCEPTION
                        WHEN others THEN
                            -- Si aún falla, insertar registros mínimos
                            INSERT INTO clients (name, email, organization) VALUES
                            ('Empresa Construcciones ABC', 'contacto@construccionesabc.cl', 'Empresa Construcciones ABC'),
                            ('Casino Marina del Sol', 'it@marinadelsol.cl', 'Casino Marina del Sol'),
                            ('Área RRHH Corporativo', 'rrhh@empresa.cl', 'Área RRHH Corporativo');
                    END;
            END;
        END IF;
        
    END IF;
END $$;

SELECT 'Tabla clients corregida exitosamente' AS status;