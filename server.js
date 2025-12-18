require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');

const host = process.env.HOST || '0.0.0.0';
const port = 3000;

const apiRouter = require('./api');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const safeJoin = (base, target) => {
  const targetPath = '.' + path.posix.normalize('/' + target.replace(/\\/g, '/'));
  return path.join(base, targetPath);
};

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    apiRouter(req, res);
    return;
  }

  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = safeJoin(__dirname, urlPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Kaynak bulunamadi');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    stream.on('error', () => {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Sunucu hatasi');
    });
  });
});

server.listen(port, host, () => {
  const displayHost = host === '0.0.0.0' ? 'localhost' : host;
  console.log(`Sunucu http://${displayHost}:${port} adresinde dinleniyor`);
});
