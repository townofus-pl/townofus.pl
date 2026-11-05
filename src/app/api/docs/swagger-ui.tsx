'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import './swagger-theme.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <p className="p-8 text-center text-gray-300">Ładowanie dokumentacji…</p>,
});

// Publiczna dokumentacja: bez formularza logowania, definicja z `/api/schema`.
// Style są pod klasą `api-docs-theme`, więc inne strony się nie zmieniają.
export default function SwaggerUIComponent() {
  return (
    <div className="api-docs-theme min-h-screen rounded-xl bg-zinc-900/50 px-2 py-4 md:px-6 text-white">
      <SwaggerUI url="/api/schema" docExpansion="list" />
    </div>
  );
}
