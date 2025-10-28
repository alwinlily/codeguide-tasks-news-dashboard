const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({
  secure: false,
  changeOrigin: true,
  xfwd: true
});

const server = http.createServer((req, res) => {
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

  // Proxy to your Next.js server running on WSL IP
  const target = 'http://172.17.0.2:3001';

  proxy.web(req, res, { target }, (err) => {
    console.error('Proxy error:', err);
    if (err.code === 'ECONNREFUSED') {
      res.writeHead(503, { 'Content-Type': 'text/html' });
      res.end(`
        <h1>🔧 Next.js Server Starting...</h1>
        <p>Your Next.js server is still starting up. Please wait a moment and refresh.</p>
        <p><a href="/">Refresh</a></p>
      `);
    } else {
      res.writeHead(502, { 'Content-Type': 'text/html' });
      res.end(`
        <h1>⚠️ Proxy Error</h1>
        <p>Error: ${err.message}</p>
        <p><a href="/">Try Again</a></p>
      `);
    }
  });
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (!res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'text/html' });
    res.end('<h1>Proxy Error</h1><p>Failed to connect to Next.js server.</p>');
  }
});

const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Next.js Proxy Server running on: http://localhost:${PORT}`);
  console.log(`📡 Forwarding to: http://172.17.0.2:3001`);
  console.log(`\n✅ Open your browser and go to: http://localhost:${PORT}`);
  console.log(`\nYour Next.js dashboard should now be accessible!`);
});