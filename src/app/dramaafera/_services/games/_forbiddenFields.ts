// Pomocnik testów: szuka w odpowiedzi pól, które nie mogą trafić do przeglądarki
// ani do klienta API. Sprawdza wszystkie poziomy zagnieżdżenia.
const FORBIDDEN_KEY = /points|^dap|^average(Points|Dap)/i;

/**
 * Zwraca ścieżki kluczy, które pasują do listy zakazanej i nie są na liście
 * dozwolonych (`allowedKeys`, np. opóźnione pole `dap`).
 */
export function findForbiddenFields(value: unknown, allowedKeys: readonly string[] = [], path = '$'): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => findForbiddenFields(item, allowedKeys, `${path}[${i}]`));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
      const here = FORBIDDEN_KEY.test(key) && !allowedKeys.includes(key) ? [`${path}.${key}`] : [];
      return [...here, ...findForbiddenFields(child, allowedKeys, `${path}.${key}`)];
    });
  }
  return [];
}
