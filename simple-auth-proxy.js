const http = require('http');
const { URL } = require('url');
const crypto = require('crypto');

// Simple session storage
const sessions = new Map();

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function isAuthenticated(req) {
  const cookie = req.headers.cookie || '';
  const sessionId = cookie.split(';')
    .find(c => c.trim().startsWith('session='))
    ?.split('=')[1];
  return sessionId && sessions.has(sessionId);
}

const authPage = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Login Required</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f0f2f5; margin: 0; padding: 20px; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
        h1 { color: #333; margin-bottom: 20px; }
        p { color: #666; margin-bottom: 30px; }
        input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        button:hover { background: #0056b3; }
        .admin-info { background: #e7f3ff; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 14px; }
        .error { color: red; margin: 10px 0; display: none; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 Login Required</h1>
        <p>Please enter your credentials to access the dashboard.</p>
        
        <div class="error" id="error">Invalid login. Please try again.</div>
        
        <form method="POST" action="/login">
            <input type="email" name="email" placeholder="Email" required><br>
            <input type="password" name="password" placeholder="Password (6+ chars)" required><br>
            <button type="submit">Sign In</button>
        </form>
        
        <div class="admin-info">
            <strong>Admin:</strong> alwin.lily@gmail.com<br>
            <strong>Demo:</strong> Use any email, password must be 6+ chars
        </div>
    </div>
    
    <script>
        if (window.location.search.includes('error=1')) {
            document.getElementById('error').style.display = 'block';
        }
    </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Handle login
  if (url.pathname === '/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const email = params.get('email');
      const password = params.get('password');

      if (email && password && password.length >= 6) {
        const sessionId = generateSessionToken();
        sessions.set(sessionId, { email, timestamp: Date.now() });
        res.setHeader('Set-Cookie', `session=${sessionId}; HttpOnly; Path=/`);
        res.writeHead(302, { 'Location': '/' });
        res.end();
      } else {
        res.writeHead(302, { 'Location': '/?error=1' });
        res.end();
      }
    });
    return;
  }

  // Handle logout
  if (url.pathname === '/logout') {
    const cookie = req.headers.cookie || '';
    const sessionId = cookie.split(';')
      .find(c => c.trim().startsWith('session='))
      ?.split('=')[1];
    if (sessionId) sessions.delete(sessionId);
    res.setHeader('Set-Cookie', 'session=; Path=/; Max-Age=0');
    res.writeHead(302, { 'Location': '/' });
    res.end();
    return;
  }

  // Check authentication
  if (!isAuthenticated(req)) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(authPage);
    return;
  }

  // Proxy to Next.js
  try {
    const target = `http://172.17.0.2:3001${url.pathname}${url.search}`;
    const proxyReq = http.request(target, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err);
      res.writeHead(502, { 'Content-Type': 'text/html' });
      res.end('<h1>Server Error</h1><p>Next.js server not reachable.</p>');
    });
    req.pipe(proxyReq);
  } catch (err) {
    console.error('Error:', err);
    res.writeHead(500);
    res.end('Server Error');
  }
});

const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Auth Proxy running on http://localhost:${PORT}`);
  console.log(`📡 Forwarding to http://172.17.0.2:3001`);
  console.log(`🔐 Authentication enabled!`);
});
