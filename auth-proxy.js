const http = require('http');
const { URL } = require('url');
const crypto = require('crypto');

// Simple session storage (in production, use Redis or database)
const sessions = new Map();

// Generate session token
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Check if user is authenticated (simple password for demo)
function isAuthenticated(req) {
  const cookie = req.headers.cookie || '';
  const sessionId = cookie.split(';')
    .find(c => c.trim().startsWith('session='))
    ?.split('=')[1];

  return sessionId && sessions.has(sessionId);
}

// Simple authentication page
const authPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authentication Required - Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        .auth-container {
            background: white;
            padding: 3rem;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 500px;
            width: 100%;
            text-align: center;
        }
        .lock-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 2rem;
            font-size: 2rem;
        }
        h1 {
            color: #333;
            margin-bottom: 1rem;
            font-size: 2rem;
        }
        .subtitle {
            color: #666;
            margin-bottom: 2rem;
            line-height: 1.6;
        }
        .form-group {
            margin-bottom: 1.5rem;
            text-align: left;
        }
        label {
            display: block;
            margin-bottom: 0.5rem;
            color: #333;
            font-weight: 500;
        }
        input {
            width: 100%;
            padding: 1rem;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        .btn {
            width: 100%;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .admin-info {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 10px;
            margin-top: 2rem;
            font-size: 0.9rem;
            color: #666;
        }
        .admin-info strong {
            color: #333;
        }
        .error {
            background: #fee;
            color: #c33;
            padding: 1rem;
            border-radius: 10px;
            margin-bottom: 1rem;
            display: none;
        }
    </style>
</head>
<body>
    <div class="auth-container">
        <div class="lock-icon">🔒</div>
        <h1>Authentication Required</h1>
        <p class="subtitle">
            Please enter your credentials to access your secure dashboard.
            This ensures your personal data remains protected.
        </p>

        <div class="error" id="error-message">
            Invalid credentials. Please try again.
        </div>

        <form method="POST" action="/auth/login">
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required placeholder="Enter your email">
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required placeholder="Enter your password">
            </div>

            <button type="submit" class="btn">
                Sign In to Dashboard
            </button>
        </form>

        <div class="admin-info">
            <strong>Admin Access:</strong> alwin.lily@gmail.com<br>
            <strong>Demo Password:</strong> admin123
        </div>
    </div>

    <script>
        // Show error if URL has error parameter
        if (window.location.search.includes('error=1')) {
            document.getElementById('error-message').style.display = 'block';
        }
    </script>
</body>
</html>
`;

const server = http.createServer(async (req, res) => {
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

  // Handle login
  if (url.pathname === '/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const params = new URLSearchParams(body);
      const email = params.get('email');
      const password = params.get('password');

      // Simple authentication (in production, use proper auth)
      if (email && password && password.length >= 6) {
        const sessionId = generateSessionToken();
        sessions.set(sessionId, { email, timestamp: Date.now() });

        res.setHeader('Set-Cookie', `session=${sessionId}; HttpOnly; SameSite=Strict; Path=/`);
        res.writeHead(302, { 'Location': '/' });
        res.end();
      } else {
        res.writeHead(302, { 'Location': '/auth/login?error=1' });
        res.end();
      }
    });
    return;
  }

  // Handle logout
  if (url.pathname === '/auth/logout') {
    const cookie = req.headers.cookie || '';
    const sessionId = cookie.split(';')
      .find(c => c.trim().startsWith('session='))
      ?.split('=')[1];

    if (sessionId) {
      sessions.delete(sessionId);
    }

    res.setHeader('Set-Cookie', 'session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
    res.writeHead(302, { 'Location': '/auth/login' });
    res.end();
    return;
  }

  // Show login page for unauthenticated users
  if (!isAuthenticated(req)) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(authPage);
    return;
  }

  // Proxy authenticated requests to Next.js
  try {
    const targetUrl = `http://172.17.0.2:3001${url.pathname}${url.search}`;
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
                <li>You are authenticated</li>
                <li>The proxy server is working</li>
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
              <a href="/" class="link">Refresh This Page</a>
              <a href="http://172.17.0.2:3001" class="link">Direct Next.js Access</a>
              <a href="/auth/logout" class="link">Sign Out</a>
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

// Clean up old sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.timestamp > 24 * 60 * 60 * 1000) { // 24 hours
      sessions.delete(sessionId);
    }
  }
}, 60 * 60 * 1000); // Check every hour

const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Authenticated Proxy Server running on: http://localhost:${PORT}`);
  console.log(`📡 Forwarding to: http://172.17.0.2:3001`);
  console.log(`\n🔐 Authentication Required!`);
  console.log(`📱 Open your browser and go to: http://localhost:${PORT}`);
  console.log(`\n💡 Use any email and password (6+ chars) to sign in`);
  console.log(`👑 Admin: alwin.lily@gmail.com`);
});