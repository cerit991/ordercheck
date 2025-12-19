const parseJsonBody = (req) => new Promise((resolve, reject) => {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    try {
      const raw = Buffer.concat(chunks).toString('utf8');
      resolve(raw ? JSON.parse(raw) : {});
    } catch (error) {
      reject(error);
    }
  });
  req.on('error', reject);
});

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

const formatSelectedCategories = (items) => {
  if (!Array.isArray(items) || !items.length) {
    return 'Belirtilmedi';
  }

  const categories = Array.from(
    new Set(
      items
        .map((item) => (item && typeof item.group === 'string' ? item.group.trim() : ''))
        .filter(Boolean),
    ),
  );

  if (!categories.length) {
    return 'Belirtilmedi';
  }

  return categories.sort((a, b) => a.localeCompare(b, 'tr')).join(', ');
};

module.exports = {
  parseJsonBody,
  normalizeForFilename,
  formatSelectedCategories,
};
