const http = require('http');
const crypto = require('crypto');

const sessions = new Map();

function generateSessionToken() {
  return crypto.randomBytes(16).toString('hex');
}

function isAuthenticated(req) {
  const cookie = req.headers.cookie || '';
  const sessionId = cookie.split(';')
    .find(c => c.trim().startsWith('session='))
    ?.split('=')[1];
  return sessionId && sessions.has(sessionId);
}

const simpleAuthPage = `<!DOCTYPE html>
<html>
<head><title>Login</title></head>
<body style="font-family: Arial; text-align: center; padding: 50px;">
    <h1>🔐 Authentication Required</h1>
    <p>Please sign in to access your dashboard.</p>
    <form method="POST" action="/login">
        <p>Email: <input type="email" name="email" required style="padding: 10px; margin: 5px;"></p>
        <p>Password: <input type="password" name="password" required style="padding: 10px; margin: 5px;"></p>
        <p><button type="submit" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px;">Sign In</button></p>
    </form>
    <p><small>Admin: alwin.lily@gmail.com | Use any password (6+ chars)</small></p>
</body>
</html>`;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Handle login
  if (req.method === 'POST' && req.url === '/login') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const email = params.get('email');
      const password = params.get('password');

      console.log(`Login attempt: ${email}`);

      if (email && password && password.length >= 6) {
        const sessionId = generateSessionToken();
        sessions.set(sessionId, { email, timestamp: Date.now() });
        console.log(`Login successful for ${email}`);
        res.setHeader('Set-Cookie', `session=${sessionId}; HttpOnly; Path=/`);
        res.writeHead(302, { 'Location': '/' });
        res.end();
      } else {
        console.log('Login failed');
        res.writeHead(302, { 'Location': '/?error=1' });
        res.end();
      }
    });
    return;
  }

  // Handle logout
  if (req.url === '/logout') {
    const cookie = req.headers.cookie || '';
    const sessionId = cookie.split(';')
      .find(c => c.trim().startsWith('session='))
      ?.split('=')[1];
    if (sessionId) {
      sessions.delete(sessionId);
      console.log('User logged out');
    }
    res.setHeader('Set-Cookie', 'session=; Path=/; Max-Age=0');
    res.writeHead(302, { 'Location': '/' });
    res.end();
    return;
  }

  // Check authentication
  if (!isAuthenticated(req)) {
    console.log('User not authenticated, showing login page');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(simpleAuthPage);
    return;
  }

  // User is authenticated, proxy to Next.js
  console.log('User authenticated, proxying to Next.js');
  
  const http = require('http');
  const proxyReq = http.request({
    hostname: '172.17.0.2',
    port: 3001,
    path: req.url,
    method: req.method,
    headers: req.headers
  }, (proxyRes) => {
    console.log(`Next.js response: ${proxyRes.statusCode}`);
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.writeHead(502, { 'Content-Type': 'text/html' });
    res.end('<h1>Backend Error</h1><p>Cannot reach Next.js server.</p>');
  });

  req.pipe(proxyReq);
});

const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Basic Auth Proxy running on http://localhost:${PORT}`);
  console.log(`📡 Forwarding to http://172.17.0.2:3001`);
  console.log(`🔐 Authentication required!`);
});
