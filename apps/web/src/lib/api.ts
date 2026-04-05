export type WebFilter = {
  priceRange?: 'cheap' | 'medium' | 'expensive';
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dietTag?: 'vegetarian' | 'vegan' | 'keto' | 'clean';
  context?: 'solo' | 'date' | 'group' | 'travel' | 'office';
};

export type FoodItem = {
  _id: string;
  name: string;
  description?: string;
  images?: string[];
  thumbnailImage?: string;
  priceRange?: string;
  calories?: number;
  cookingStyle?: string;
};

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

const queryString = (filters?: WebFilter) => {
  if (!filters) return '';
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
};

export const getRandomFood = async (filters?: WebFilter): Promise<FoodItem | null> => {
  const query = queryString(filters);
  const response = await fetch(`${API_BASE}/foods/random${query ? `?${query}` : ''}`, {
    cache: 'no-store',
  });
  const body = await parseJson<{ data: FoodItem | null }>(response);
  return body.data;
};

export const getSwipeQueue = async (filters?: WebFilter): Promise<FoodItem[]> => {
  const query = queryString(filters);
  const response = await fetch(`${API_BASE}/foods/swipe-queue${query ? `?${query}` : ''}`, {
    cache: 'no-store',
  });
  const body = await parseJson<{ data: FoodItem[] }>(response);
  return body.data ?? [];
};

export const getFoodDetail = async (id: string): Promise<FoodItem | null> => {
  const response = await fetch(`${API_BASE}/foods/${id}`, { cache: 'no-store' });
  const body = await parseJson<{ data: FoodItem | null }>(response);
  return body.data;
};

export const postAction = async (payload: {
  sessionId: string;
  foodId?: string;
  actionType: 'swipe_right' | 'swipe_left' | 'view_detail' | 'shake_result';
  context: 'solo' | 'date' | 'group' | 'travel' | 'office' | 'none';
  filterSnapshot?: Record<string, string | undefined>;
}) => {
  const response = await fetch(`${API_BASE}/actions/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      filterSnapshot: payload.filterSnapshot ?? {},
      deviceType: 'web',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to post action (${response.status})`);
  }
};
