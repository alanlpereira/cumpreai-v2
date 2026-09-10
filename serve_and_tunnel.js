const http = require('http');
const fs = require('fs');
const path = require('path');
const localtunnel = require('localtunnel');

const rootDir = __dirname;
const port = 8085;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/') reqUrl = '/index.html';
  const filePath = path.join(rootDir, reqUrl);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(port, async () => {
  console.log(`Local server active on http://localhost:${port}`);
  try {
    const tunnel = await localtunnel({ port: port, subdomain: 'cumpreai-v2-preview' });
    console.log(`\n==================================================`);
    console.log(`PUBLIC LIVE PREVIEW URL: ${tunnel.url}`);
    console.log(`==================================================\n`);
    tunnel.on('close', () => {
      console.log('Tunnel closed');
    });
  } catch (err) {
    console.error('Failed to create tunnel:', err.message);
  }
});
