const fs = require('fs');
const path = require('path');

const sendJson = (res, data, statusCode = 200) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
};

module.exports = (req, res) => {
  if (req.method !== 'GET' || req.url !== '/api/products') {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ message: 'Endpoint bulunamadi' }));
    return;
  }

  const filePath = path.join(__dirname, '..', 'product.json');
  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      sendJson(res, { message: 'Urunler yuklenemedi' }, 500);
      return;
    }

    try {
      const data = JSON.parse(content);
      sendJson(res, data);
    } catch (parseError) {
      sendJson(res, { message: 'Gecersiz veri formati' }, 500);
    }
  });
};
