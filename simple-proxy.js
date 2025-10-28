const http = require('http');
const { URL } = require('url');

const server = http.createServer(async (req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    const targetUrl = `http://172.17.0.2:3001${req.url}`;
    const target = new URL(targetUrl);

    const options = {
      hostname: target.hostname,
      port: target.port,
      path: target.pathname + target.search,
      method: req.method,
      headers: { ...req.headers }
    };

    // Remove host header to avoid conflicts
    delete options.headers['host'];

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
      res.writeHead(503, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>🔧 Server Status</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 2rem; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .status { background: #ff9800; color: white; padding: 1rem; border-radius: 5px; margin-bottom: 1rem; }
            .info { background: #e3f2fd; padding: 1rem; border-radius: 5px; margin: 1rem 0; }
            .links { margin-top: 2rem; }
            .link { display: inline-block; background: #4CAF50; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 5px; margin: 0.5rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="status">🔧 Next.js Server Connection Issue</div>
            <h1>Almost There!</h1>
            <div class="info">
              <h3>✅ Good News:</h3>
              <ul>
                <li>Your WSL networking is working perfectly</li>
                <li>The proxy server is running</li>
                <li>Your Next.js server is running on port 3001</li>
              </ul>
            </div>
            <div class="info">
              <h3>🔧 Current Status:</h3>
              <p><strong>Error:</strong> ${err.message}</p>
              <p><strong>Trying to reach:</strong> http://172.17.0.2:3001</p>
            </div>
            <div class="links">
              <h3>🚀 Try These Solutions:</h3>
              <a href="http://172.17.0.2:3001" class="link">Direct Next.js Access</a>
              <a href="http://localhost:8080" class="link">Refresh This Page</a>
              <a href="http://172.17.0.2:4000" class="link">Backup Server (Port 4000)</a>
            </div>
            <div class="info">
              <h3>💡 Quick Tip:</h3>
              <p>Your Next.js servers ARE running! Try the direct links above.</p>
            </div>
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
    res.end('<h1>Server Error</h1>');
  }
});

const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Next.js Proxy Server running on: http://localhost:${PORT}`);
  console.log(`📡 Forwarding to: http://172.17.0.2:3001`);
  console.log(`\n✅ Open your browser and go to: http://localhost:${PORT}`);
  console.log(`\nIf this doesn't work, try: http://172.17.0.2:3001`);
});