const { parseJsonBody } = require('./utils');
const { createOrderSnapshot } = require('./orderText');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ message: 'Yontem desteklenmiyor' }));
    return;
  }

  try {
    const payload = await parseJsonBody(req);
    const { requester, department, items } = payload || {};

    if (!requester || !department || !Array.isArray(items) || !items.length) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ message: 'Gecersiz veya eksik veri' }));
      return;
    }

    const snapshot = createOrderSnapshot({ requester, department, items });

    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `inline; filename="${snapshot.fileName}"`,
      'X-Order-Id': snapshot.orderId,
      'X-Order-Timestamp': snapshot.sentAt.toISOString(),
    });
    res.end(snapshot.content);
  } catch (error) {
    console.error('Siparis fis olusturulamadı:', error);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ message: 'Siparis fis olusturulurken hata olustu' }));
    }
  }
};
