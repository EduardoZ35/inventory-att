-- Verificar estructura completa de providers para entender todas las columnas obligatorias

SELECT 'ESTRUCTURA COMPLETA DE PROVIDERS:' as info;

SELECT 
    ordinal_position as "#",
    column_name as "Columna",
    data_type as "Tipo",
    CASE WHEN is_nullable = 'NO' THEN '🔴 OBLIGATORIA' ELSE '🟢 Opcional' END as "Estado",
    column_default as "Default"
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'providers'
ORDER BY ordinal_position;

SELECT 'CONTENIDO ACTUAL:' as info;
SELECT * FROM public.providers LIMIT 3;




