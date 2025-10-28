const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle different routes
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎉 Server Working!</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            color: white;
        }
        .container {
            text-align: center;
            max-width: 600px;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        .info {
            background: rgba(255, 255, 255, 0.2);
            padding: 1rem;
            border-radius: 10px;
            margin: 1rem 0;
        }
        .links {
            margin-top: 2rem;
        }
        .link {
            display: inline-block;
            background: #4CAF50;
            color: white;
            padding: 1rem 2rem;
            text-decoration: none;
            border-radius: 50px;
            margin: 0.5rem;
            transition: all 0.3s ease;
        }
        .link:hover {
            background: #45a049;
            transform: translateY(-2px);
        }
        .status {
            background: #4CAF50;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            display: inline-block;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 SUCCESS!</h1>
        <div class="status">SERVER IS RUNNING</div>

        <div class="info">
            <h3>✅ Your web server is working perfectly!</h3>
            <p>This simple server proves that your WSL network configuration can work.</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div class="info">
            <h3>🔧 Next.js Server Status</h3>
            <p>Your Next.js apps are running on:</p>
            <ul style="text-align: left; display: inline-block;">
                <li>📱 Port 3001: Main app</li>
                <li>📱 Port 4000: Backup app</li>
            </ul>
        </div>

        <div class="links">
            <h3>🚀 Try Your Next.js Apps:</h3>
            <a href="http://172.17.0.2:3001" class="link">App on Port 3001</a>
            <a href="http://172.17.0.2:4000" class="link">App on Port 4000</a>
        </div>

        <div class="info">
            <h3>💡 If the links don't work:</h3>
            <p>Try these solutions:</p>
            <ol style="text-align: left; display: inline-block;">
                <li>Use Microsoft Edge browser</li>
                <li>Check Windows Firewall settings</li>
                <li>Try incognito/private mode</li>
                <li>Use the IPs directly in browser</li>
            </ol>
        </div>
    </div>
</body>
</html>
    `);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('Not Found');
  }
});

const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple server running on:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://172.17.0.2:${PORT}`);
  console.log(`   http://192.168.65.7:${PORT}`);
  console.log(`\n✅ Server is ready! Try the URLs in your browser.`);
});