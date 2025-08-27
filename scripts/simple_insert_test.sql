-- Script ultra simple para INSERT con manejo de error visible

-- Solo intentar insertar el campo obligatorio que sabemos que existe
SELECT 'Intentando INSERT con solo invoice_number...' as paso;

BEGIN;

-- Esto debería fallar y mostrarnos exactamente qué más necesitamos
INSERT INTO public.invoices (invoice_number) 
VALUES ('SIMPLE-TEST');

-- Si llegamos aquí, funcionó
SELECT '✅ ¡INSERT exitoso con solo invoice_number!' as resultado;
SELECT * FROM public.invoices WHERE invoice_number = 'SIMPLE-TEST';

COMMIT;


