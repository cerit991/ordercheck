const fs = require('fs/promises');
const path = require('path');
const nodemailer = require('nodemailer');
const { parseJsonBody } = require('./utils');
const { generatePdfBuffer, buildTextBody } = require('./pdfGenerator');

let cachedTransporter = null;
const ORDERS_DIR = path.join(__dirname, '..', 'orders');

const normalizeForFilename = (value) => {
  if (!value) {
    return 'genel';
  }

  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'genel';
};

const persistOrderAsText = async ({ requester, department, items, sentAt }) => {
  const orderId = sentAt.getTime().toString(36);
  const datePart = sentAt.toISOString().slice(0, 10);
  const safeDepartment = normalizeForFilename(department);
  const fileName = `siparis-${orderId}-${safeDepartment}-${datePart}.txt`;
  const filePath = path.join(ORDERS_DIR, fileName);

  const lines = [
    `Siparis ID: ${orderId}`,
    `Olusturulma: ${sentAt.toLocaleString('tr-TR')}`,
    `Departman: ${department}`,
    `Siparisi Olusturan: ${requester}`,
    '',
    'Kalem Listesi:',
    ...items.map((item, index) => {
      const groupSuffix = item.group ? ` (${item.group})` : '';
      return `${index + 1}. ${item.name}${groupSuffix} - ${item.quantity} ${item.unit}`;
    }),
    '',
    `Toplam Kalem: ${items.length}`,
  ];

  await fs.mkdir(ORDERS_DIR, { recursive: true });
  await fs.writeFile(filePath, `${lines.join('\n')}\n`, 'utf8');

  return { orderId, filePath };
};

const getTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || (process.env.SMTP_SECURE === 'false' ? 587 : 465));
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;
  const user = process.env.SMTP_USER || process.env.SENDER_EMAIL;
  const pass = process.env.SMTP_PASS || process.env.SENDER_PASSWORD;

  if (!user || !pass) {
    throw new Error('Mail gonderimi icin kullanici veya sifre eksik');
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  return cachedTransporter;
};

module.exports = async (req, res) => {
  try {
    const payload = await parseJsonBody(req);
    const { requester, department, items } = payload || {};

    if (!requester || !department || !Array.isArray(items) || !items.length) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ message: 'Gecersiz veya eksik veri' }));
      return;
    }

    const senderEmail = process.env.SENDER_EMAIL;
    const recipientEmail = process.env.RECIPIENT_EMAIL;
    const senderPassword = process.env.SENDER_PASSWORD;

    if (!senderEmail || !recipientEmail || !senderPassword) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ message: 'Mail ayarlari eksik. Lutfen .env dosyasini kontrol edin.' }));
      return;
    }

    const pdfBuffer = await generatePdfBuffer({ requester, department, items });
    const textBody = buildTextBody({ requester, department, items });

    const transporter = getTransporter();

    const safeRequester = requester.replace(/[^a-z0-9\-]+/gi, '-');
    const attachmentName = `siparis-${safeRequester || 'talep'}.pdf`;

    await transporter.sendMail({
      from: senderEmail,
      to: recipientEmail,
      subject: `Siparis Talebi - ${requester}`,
      text: textBody,
      attachments: [
        {
          filename: attachmentName,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    const sentAt = new Date();
    const { orderId } = await persistOrderAsText({ requester, department, items, sentAt });

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ message: 'Mail basariyla gonderildi', orderId }));
  } catch (error) {
    console.error('Mail gonderimi basarisiz:', error);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ message: 'Mail gonderimi sirasinda bir hata olustu' }));
    }
  }
};
