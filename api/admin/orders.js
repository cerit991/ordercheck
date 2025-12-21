const fs = require('fs/promises');
const path = require('path');
const { ensureAuthorized, sendJson } = require('./utils');

const ORDERS_DIR = path.join(__dirname, '..', '..', 'orders');

const extractLineValue = (content, label) => {
  const pattern = new RegExp(`^${label}:\s*(.+)$`, 'mi');
  const match = pattern.exec(content);
  return match ? match[1].trim() : null;
};

const toOrderPayload = async (entry) => {
  try {
    const filePath = path.join(ORDERS_DIR, entry);
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      return null;
    }

    const content = await fs.readFile(filePath, 'utf8');

    const metadata = {
      orderId: extractLineValue(content, 'Siparis ID'),
      createdAtText: extractLineValue(content, 'Olusturulma'),
      department: extractLineValue(content, 'Departman'),
      company: extractLineValue(content, 'Firma'),
      requester: extractLineValue(content, 'Siparisi Olusturan'),
    };

    return {
      name: entry,
      size: stats.size,
      modifiedAt: stats.mtime.toISOString(),
      createdAt: stats.birthtime ? stats.birthtime.toISOString() : stats.mtime.toISOString(),
      content,
      metadata,
    };
  } catch (error) {
    console.error('Siparis dosyasi okunamadi:', entry, error);
    return null;
  }
};

const listOrders = async () => {
  try {
    const entries = await fs.readdir(ORDERS_DIR);
    const payloads = await Promise.all(entries.map(toOrderPayload));

    return payloads
      .filter(Boolean)
      .sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

module.exports = async (req, res) => {
  const token = ensureAuthorized(req, res);
  if (!token) {
    return;
  }

  if (req.method !== 'GET') {
    sendJson(res, { message: 'Yontem desteklenmiyor' }, 405);
    return;
  }

  try {
    const orders = await listOrders();
    sendJson(res, { orders });
  } catch (error) {
    console.error('Siparis gecmisi yuklenemedi:', error);
    sendJson(res, { message: 'Siparis gecmisi yuklenemedi' }, 500);
  }
};
