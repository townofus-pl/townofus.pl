// Osobny plik, żeby test mógł go załadować w Node (index.ts importuje `cloudflare:workers`).
export function handleFetch(): Response {
    return new Response('Not Found', { status: 404 });
}
