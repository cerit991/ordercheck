const { parseJsonBody } = require('./utils');
const { generatePdfBuffer } = require('./pdfGenerator');

module.exports = async (req, res) => {
  try {
    const payload = await parseJsonBody(req);
    const { requester, department, items } = payload;

    if (!requester || !department || !Array.isArray(items) || !items.length) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ message: 'Gecersiz veya eksik veri' }));
      return;
    }

    const pdfBuffer = await generatePdfBuffer({ requester, department, items });

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="siparis.pdf"',
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  } catch (error) {
    console.error('PDF generation failed:', error);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ message: 'PDF olusturulurken bir hata olustu' }));
    } else {
      res.end();
    }
  }
};