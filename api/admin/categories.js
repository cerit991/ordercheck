const fs = require('fs/promises');
const path = require('path');
const { ensureAuthorized, sendJson } = require('./utils');

const categoriesPath = path.join(__dirname, '..', '..', 'categories.json');
const productsPath = path.join(__dirname, '..', '..', 'product.json');

const normalizeName = (value) => value.trim().toUpperCase();

const deriveCategoriesFromProducts = async () => {
  try {
    const raw = await fs.readFile(productsPath, 'utf8');
    const products = JSON.parse(raw);
    const unique = Array.from(new Set(products.map((item) => normalizeName(item.group || 'GENEL'))));
    unique.sort();
    await fs.writeFile(categoriesPath, `${JSON.stringify(unique, null, 2)}\n`, 'utf8');
    return unique;
  } catch (error) {
    console.error('Kategori olusturulamadi:', error);
    return [];
  }
};

const loadCategories = async () => {
  try {
    const raw = await fs.readFile(categoriesPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return deriveCategoriesFromProducts();
    }
    console.error('Kategori dosyasi okunamadi:', error);
    return [];
  }
};

const saveCategories = async (categories) => {
  await fs.writeFile(categoriesPath, `${JSON.stringify(categories, null, 2)}\n`, 'utf8');
};

module.exports = async (req, res) => {
  const token = ensureAuthorized(req, res);
  if (!token) {
    return;
  }

  if (req.method === 'GET') {
    const categories = await loadCategories();
    sendJson(res, { categories });
    return;
  }

  if (req.method === 'POST') {
    try {
      const { parseJsonBody } = require('../utils');
      const body = await parseJsonBody(req);
      const name = typeof body?.name === 'string' ? normalizeName(body.name) : '';

      if (!name) {
        sendJson(res, { message: 'Kategori adi gerekli' }, 400);
        return;
      }

      const categories = await loadCategories();
      if (categories.includes(name)) {
        sendJson(res, { message: 'Kategori zaten mevcut' }, 409);
        return;
      }

      const updated = [...categories, name];
      updated.sort();
      await saveCategories(updated);
      sendJson(res, { message: 'Kategori eklendi', categories: updated });
    } catch (error) {
      console.error('Kategori eklenemedi:', error);
      sendJson(res, { message: 'Kategori ekleme basarisiz' }, 500);
    }
    return;
  }

  sendJson(res, { message: 'Yontem desteklenmiyor' }, 405);
};
