'use client';

import { lazy, Suspense } from 'react';

// Importación lazy de las devtools para evitar problemas en build
const ReactQueryDevtoolsProduction = lazy(() =>
  import('@tanstack/react-query-devtools/build/modern/production.js').then(
    (d) => ({
      default: d.ReactQueryDevtools,
    }),
  ),
);

const ReactQueryDevtoolsDevelopment = lazy(() =>
  import('@tanstack/react-query-devtools').then((d) => ({
    default: d.ReactQueryDevtools,
  })),
);

export default function ReactQueryDevtools() {
  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <ReactQueryDevtoolsDevelopment initialIsOpen={false} />
    </Suspense>
  );
}



