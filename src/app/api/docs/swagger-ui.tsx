'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <p className="p-8 text-center text-gray-600">Ładowanie Swagger UI…</p>,
});

// Publiczna dokumentacja: bez formularza logowania, definicja z `/api/schema`.
export default function SwaggerUIComponent() {
  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI url="/api/schema" docExpansion="list" />
    </div>
  );
}
