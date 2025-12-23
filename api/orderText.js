const { normalizeForFilename, formatSelectedCategories } = require('./utils');

const ensureDate = (value) => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'number') {
    return new Date(value);
  }
  if (typeof value === 'string') {
    return new Date(value);
  }
  return new Date();
};

const buildOrderLines = ({ orderId, sentAt, requester, department, items }) => {
  const categorySummary = formatSelectedCategories(items);

  const lines = [
    `Siparis ID: ${orderId}`,
    `Olusturulma: ${sentAt.toLocaleString('tr-TR')}`,
    `Departman: ${department}`,
    `Firma: ${categorySummary}`,
    `Siparisi Olusturan: ${requester}`,
    '',
    'Kalem Listesi:',
    ...items.map((item, index) => {
      return `${index + 1}. ${item.name} --- ${item.quantity} ${item.unit}`;
    }),
    '',
    `Toplam Kalem: ${items.length}`,
  ];

  return lines;
};

const createOrderSnapshot = ({ requester, department, items, sentAt = new Date() }) => {
  const timestamp = ensureDate(sentAt);
  const orderId = timestamp.getTime().toString(36);
  const safeDepartment = normalizeForFilename(department);
  const datePart = timestamp.toISOString().slice(0, 10);
  const lines = buildOrderLines({ orderId, sentAt: timestamp, requester, department, items });

  return {
    orderId,
    sentAt: timestamp,
    fileName: `siparis-${orderId}-${safeDepartment}-${datePart}.txt`,
    content: `${lines.join('\n')}\n`,
  };
};

module.exports = {
  createOrderSnapshot,
  buildOrderLines,
};
