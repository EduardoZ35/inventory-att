-- Verificar estructura actual de la tabla providers

SELECT 'ESTRUCTURA ACTUAL DE PROVIDERS:' as info;

SELECT 
    ordinal_position as "#",
    column_name as "Columna",
    data_type as "Tipo",
    is_nullable as "Nullable",
    column_default as "Default"
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'providers'
ORDER BY ordinal_position;

SELECT 'CONTENIDO ACTUAL DE PROVIDERS:' as info;
SELECT * FROM public.providers LIMIT 5;

