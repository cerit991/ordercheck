const fs = require('fs/promises');
const path = require('path');
const { ensureAuthorized, sendJson } = require('./utils');
const { parseJsonBody } = require('../utils');

const productsPath = path.join(__dirname, '..', '..', 'product.json');
const categoriesPath = path.join(__dirname, '..', '..', 'categories.json');

const UNIT_SET = new Set(['ADET', 'KG', 'LT']);
const CODE_PATTERN = /^ST0(\d{4})$/;

const readProducts = async () => {
  const raw = await fs.readFile(productsPath, 'utf8');
  return JSON.parse(raw);
};

const writeProducts = async (products) => {
  await fs.writeFile(productsPath, `${JSON.stringify(products, null, 2)}\n`, 'utf8');
};

const normalizeCodeNumber = (code) => {
  if (typeof code !== 'string') {
    return null;
  }
  const match = CODE_PATTERN.exec(code.trim().toUpperCase());
  if (!match) {
    return null;
  }
  return Number.parseInt(match[1], 10);
};

const generateNextCode = (products) => {
  const highest = products.reduce((max, product) => {
    const value = normalizeCodeNumber(product.code);
    return value && value > max ? value : max;
  }, 0);

  const nextValue = highest + 1;
  const suffix = String(nextValue).padStart(4, '0');
  return `ST0${suffix}`;
};

const loadCategories = async () => {
  try {
    const raw = await fs.readFile(categoriesPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      try {
        const productsRaw = await fs.readFile(productsPath, 'utf8');
        const products = JSON.parse(productsRaw);
        const categories = Array.from(
          new Set(
            products
              .map((item) => (item.group || '').trim().toUpperCase())
              .filter((value) => Boolean(value)),
          ),
        );
        categories.sort();
        await fs.writeFile(categoriesPath, `${JSON.stringify(categories, null, 2)}\n`, 'utf8');
        return categories;
      } catch (fallbackError) {
        console.error('Kategori cikartilamadi:', fallbackError);
        return [];
      }
    }
    console.error('Kategori dosyasi okunamadi:', error);
    return [];
  }
};

const ensureCategoryExists = async (group) => {
  const categories = await loadCategories();
  return categories.includes(group);
};

module.exports = async (req, res) => {
  const token = ensureAuthorized(req, res);
  if (!token) {
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const name = typeof body?.name === 'string' ? body.name.trim() : '';
      const group = typeof body?.group === 'string' ? body.group.trim().toUpperCase() : '';
      const unitRaw = typeof body?.unit === 'string' ? body.unit.trim().toUpperCase() : '';

      if (!name || !group || !UNIT_SET.has(unitRaw)) {
        sendJson(res, { message: 'Gecersiz urun bilgisi' }, 400);
        return;
      }

      if (!(await ensureCategoryExists(group))) {
        sendJson(res, { message: 'Kategori bulunamadi' }, 400);
        return;
      }

      const products = await readProducts();
      const code = generateNextCode(products);

      const newProduct = {
        code,
        name,
        group,
        unit: unitRaw,
      };

      const updated = [...products, newProduct];
      await writeProducts(updated);
      sendJson(res, { message: 'Urun eklendi', product: newProduct });
    } catch (error) {
      console.error('Urun ekleme hatasi:', error);
      sendJson(res, { message: 'Urun ekleme basarisiz' }, 500);
    }
    return;
  }

  if (req.method === 'DELETE') {
    try {
      const body = await parseJsonBody(req);
      const code = typeof body?.code === 'string' ? body.code.trim().toUpperCase() : '';

      if (!code) {
        sendJson(res, { message: 'Urun kodu gerekli' }, 400);
        return;
      }

      const products = await readProducts();
      const index = products.findIndex((item) => item.code === code);

      if (index === -1) {
        sendJson(res, { message: 'Urun bulunamadi' }, 404);
        return;
      }

      const [removed] = products.splice(index, 1);
      await writeProducts(products);
      sendJson(res, { message: 'Urun silindi', product: removed });
    } catch (error) {
      console.error('Urun silme hatasi:', error);
      sendJson(res, { message: 'Urun silme basarisiz' }, 500);
    }
    return;
  }

  sendJson(res, { message: 'Yontem desteklenmiyor' }, 405);
};
