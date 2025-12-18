const { URL } = require('url');
const productsHandler = require('./products');
const pdfHandler = require('./pdf');
const settingsHandler = require('./settings');
const emailHandler = require('./email');

module.exports = (req, res) => {
  const base = `http://${req.headers.host || 'localhost'}`;
  const { pathname } = new URL(req.url, base);

  if (pathname === '/api/products' && req.method === 'GET') {
    productsHandler(req, res);
    return;
  }

  if (pathname === '/api/orders/pdf' && req.method === 'POST') {
    pdfHandler(req, res);
    return;
  }

  if (pathname === '/api/orders/email' && req.method === 'POST') {
    emailHandler(req, res);
    return;
  }

  if (pathname === '/api/settings' && req.method === 'GET') {
    settingsHandler(req, res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ message: 'Endpoint bulunamadi' }));
};
