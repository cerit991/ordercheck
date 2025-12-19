const { deleteSession } = require('./sessionStore');
const { COOKIE_NAME, extractToken, sendJson } = require('./utils');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    sendJson(res, { message: 'Yontem desteklenmiyor' }, 405);
    return;
  }

  const token = extractToken(req);
  if (token) {
    deleteSession(token);
  }

  const cookie = `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;

  sendJson(res, { message: 'Cikis yapildi' }, 200, {
    'Set-Cookie': cookie,
  });
};
