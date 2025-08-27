import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo antes de que los datos se consideren obsoletos
      staleTime: 5 * 60 * 1000, // 5 minutos
      
      // Tiempo antes de que los datos en caché se eliminen
      gcTime: 10 * 60 * 1000, // 10 minutos
      
      // Número de reintentos en caso de error
      retry: 3,
      
      // No refrescar al enfocar la ventana por defecto
      refetchOnWindowFocus: false,
      
      // No refrescar al reconectar por defecto
      refetchOnReconnect: 'always',
      
      // Mantener datos anteriores durante refetch (reemplaza keepPreviousData en v5)
      placeholderData: (previousData: any) => previousData,
    },
    mutations: {
      // Reintentar mutaciones en caso de error
      retry: 2,
      
      // Tiempo de espera entre reintentos
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
