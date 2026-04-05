const DEFAULT_API_BASE = 'http://localhost:3100/api/v1';

const API_BASE = (() => {
  const raw = process.env['NEXT_PUBLIC_API_URL']?.trim();
  if (!raw) return DEFAULT_API_BASE;
  return raw.replace(/\/+$/, '');
})();

const parseJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

export const fetchFoods = async () => {
  const response = await fetch(`${API_BASE}/foods/?page=1&limit=20`, { cache: 'no-store' });
  const body = await parseJson<{ data: unknown[] }>(response);
  return body.data ?? [];
};

export const fetchCategories = async () => {
  const response = await fetch(`${API_BASE}/categories/`, { cache: 'no-store' });
  const body = await parseJson<{ data: unknown[] }>(response);
  return body.data ?? [];
};
