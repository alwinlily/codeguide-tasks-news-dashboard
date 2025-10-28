const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  // Remove the leading slash if any
  const target = `http://172.17.0.2:3001${req.url}`;

  proxy.web(req, res, {
    target: 'http://172.17.0.2:3001',
    changeOrigin: true
  }, (err) => {
    console.error('Proxy error:', err);
    res.writeHead(502);
    res.end('Proxy Error');
  });
});

const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Forwarding to http://172.17.0.2:3001`);
});