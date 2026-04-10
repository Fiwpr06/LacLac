const WIKIPEDIA_HOSTS = ['vi.wikipedia.org', 'en.wikipedia.org'] as const;
const WIKIPEDIA_FETCH_HEADERS = {
  'User-Agent': 'LacLacImageBot/1.0 (+https://laclac.vn)',
  'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
};

type WikipediaSearchResponse = {
  query?: {
    search?: Array<{
      title?: string;
    }>;
  };
};

type WikipediaSummaryResponse = {
  originalimage?: {
    source?: string;
  };
  thumbnail?: {
    source?: string;
  };
};

const fetchJson = async <T>(url: string): Promise<T | undefined> => {
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: WIKIPEDIA_FETCH_HEADERS,
    });
    if (!response.ok) {
      return undefined;
    }

    return (await response.json()) as T;
  } catch {
    return undefined;
  }
};

const isHttpUrl = (value: string | undefined): value is string => {
  if (!value) {
    return false;
  }

  return /^https?:\/\//i.test(value.trim());
};

const searchWikipediaTitle = async (
  host: (typeof WIKIPEDIA_HOSTS)[number],
  query: string,
): Promise<string | undefined> => {
  const url = new URL(`https://${host}/w/api.php`);
  url.searchParams.set('action', 'query');
  url.searchParams.set('list', 'search');
  url.searchParams.set('format', 'json');
  url.searchParams.set('utf8', '1');
  url.searchParams.set('srlimit', '1');
  url.searchParams.set('srsearch', query);

  const result = await fetchJson<WikipediaSearchResponse>(url.toString());
  const title = result?.query?.search?.[0]?.title?.trim();

  return title || undefined;
};

const fetchWikipediaImageByTitle = async (
  host: (typeof WIKIPEDIA_HOSTS)[number],
  title: string,
): Promise<string | undefined> => {
  const summaryUrl = `https://${host}/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const result = await fetchJson<WikipediaSummaryResponse>(summaryUrl);
  const imageUrl = result?.thumbnail?.source ?? result?.originalimage?.source;

  return isHttpUrl(imageUrl) ? imageUrl : undefined;
};

export const resolveAutoImageUrl = async (dishName: string): Promise<string | undefined> => {
  const normalizedDishName = dishName.trim();
  if (!normalizedDishName) {
    return undefined;
  }

  const queries = Array.from(
    new Set([
      normalizedDishName,
      `${normalizedDishName} mon an`,
      `${normalizedDishName} Viet Nam`,
      `${normalizedDishName} food`,
    ]),
  );

  for (const host of WIKIPEDIA_HOSTS) {
    for (const query of queries) {
      const title = await searchWikipediaTitle(host, query);
      if (!title) {
        continue;
      }

      const imageUrl = await fetchWikipediaImageByTitle(host, title);
      if (imageUrl) {
        return imageUrl;
      }
    }
  }

  return undefined;
};
