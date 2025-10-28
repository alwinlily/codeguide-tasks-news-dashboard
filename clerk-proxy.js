const http = require('http');
const { URL } = require('url');

// Simple proxy that forwards all requests to Next.js
// This solves the WSL networking issue while keeping Clerk authentication
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Forward all requests to Next.js (including Clerk authentication)
  try {
    const targetUrl = `http://localhost:3002${url.pathname}${url.search}`;
    const target = new URL(targetUrl);

    const options = {
      hostname: target.hostname,
      port: target.port,
      path: target.pathname + target.search,
      method: req.method,
      headers: {
        ...req.headers,
        'host': 'localhost:3002',  // Keep original host for Next.js
        'x-forwarded-host': 'localhost:8080',
        'x-forwarded-proto': 'http',
        'x-forwarded-for': req.socket.remoteAddress || '127.0.0.1'
      }
    };

    // Remove problematic headers that might interfere
    delete options.headers['connection'];
    delete options.headers['accept-encoding'];

    const proxyReq = http.request(options, (proxyRes) => {
      // Forward response headers
      Object.keys(proxyRes.headers).forEach(key => {
        res.setHeader(key, proxyRes.headers[key]);
      });
      res.writeHead(proxyRes.statusCode);

      // Forward response body
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err);
      res.writeHead(502, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Connection Error</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 2rem; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
            .container { max-width: 500px; background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
            h1 { color: #e74c3c; margin-bottom: 1rem; }
            p { color: #666; margin-bottom: 1.5rem; }
            .info { background: #e7f3ff; padding: 1rem; border-radius: 5px; margin: 1rem 0; }
            .retry { display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔌 Connection Error</h1>
            <p>Cannot reach the Next.js application server.</p>
            <div class="info">
              <strong>Error:</strong> ${err.message}<br>
              <strong>Trying to reach:</strong> http://localhost:3002
            </div>
            <p>Make sure the Next.js server is running on port 3002.</p>
            <a href="/" class="retry">Retry</a>
          </div>
        </body>
        </html>
      `);
    });

    // Forward request body
    req.pipe(proxyReq);

  } catch (err) {
    console.error('Server error:', err);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('<h1>Server Error</h1><p>Internal server error occurred.</p>');
  }
});

const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Clerk Proxy Server running on: http://localhost:${PORT}`);
  console.log(`📡 Forwarding to: http://localhost:3002`);
  console.log(`\n✅ Your Next.js app with Clerk authentication is now accessible!`);
  console.log(`🔐 Clerk will handle authentication (sign-in, sign-up, etc.)`);
  console.log(`\n📱 Open your browser and go to: http://localhost:${PORT}`);
  console.log(`👑 Admin: alwin.lily@gmail.com`);
});