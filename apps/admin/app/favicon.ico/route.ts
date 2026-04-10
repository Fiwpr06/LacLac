const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f97316"/><stop offset="1" stop-color="#fb923c"/></linearGradient></defs><rect width="64" height="64" rx="12" fill="url(#g)"/><text x="32" y="40" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="24" font-weight="700">LL</text></svg>`;

export function GET(): Response {
  return new Response(faviconSvg, {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': 'image/svg+xml; charset=utf-8',
    },
  });
}
