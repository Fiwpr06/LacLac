const http = require('http');

// Map các route của microservices đang chạy
const routes = {
  '/api/v1/auth': 3001,
  '/api/v1/users': 3001,
  '/api/v1/foods': 3002,
  '/api/v1/categories': 3002,
  '/api/v1/actions': 3003,
  '/api/v1/favorites': 3003,
  '/api/v1/history': 3003,
  '/api/v1/recommendations': 3004,
  '/api/v1/media': 3005,
};

http.createServer((req, res) => {
  // Fix CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let targetPort = 3002; // Mặc định chuyển đến food-service
  for (const [path, port] of Object.entries(routes)) {
    if (req.url.startsWith(path)) {
      targetPort = port;
      break;
    }
  }

  const options = {
    hostname: '127.0.0.1',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxyReq, { end: true });

  proxyReq.on('error', (e) => {
    res.writeHead(502);
    res.end(`Bad Gateway: ${e.message}`);
  });
}).listen(8080, () => {
  console.log('🚀 Local API Gateway đang chạy tại cổng 8080');
  console.log('👉 Sửa EXPO_PUBLIC_API_URL=http://<IP_WIFI_CỦA_BẠN>:8080/api/v1');
});
