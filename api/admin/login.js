const { createSession } = require('./sessionStore');
const { COOKIE_NAME, sendJson } = require('./utils');
const { parseJsonBody } = require('../utils');

const MAX_AGE_SECONDS = 12 * 60 * 60; // 12 hours

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    sendJson(res, { message: 'Yontem desteklenmiyor' }, 405);
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    sendJson(res, { message: 'Admin sifresi tanimli degil' }, 500);
    return;
  }

  try {
    const body = await parseJsonBody(req);
    const password = body?.password;

    if (!password || password !== adminPassword) {
      sendJson(res, { message: 'Gecersiz sifre' }, 401);
      return;
    }

    const token = createSession();
    const cookie = `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${MAX_AGE_SECONDS}`;

    sendJson(res, { message: 'Giris basarili' }, 200, {
      'Set-Cookie': cookie,
    });
  } catch (error) {
    console.error('Admin login failed:', error);
    sendJson(res, { message: 'Giris basarisiz' }, 500);
  }
};
