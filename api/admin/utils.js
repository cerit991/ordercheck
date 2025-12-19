const { validateSession } = require('./sessionStore');

const COOKIE_NAME = 'admin_token';

const parseCookies = (req) => {
  const header = req.headers.cookie;
  if (!header) {
    return {};
  }

  return header.split(';').reduce((acc, pair) => {
    const [rawKey, rawValue] = pair.split('=');
    if (!rawKey) {
      return acc;
    }
    const key = rawKey.trim();
    const value = rawValue ? decodeURIComponent(rawValue.trim()) : '';
    acc[key] = value;
    return acc;
  }, {});
};

const sendJson = (res, payload, statusCode = 200, extraHeaders = {}) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    ...extraHeaders,
  });
  res.end(JSON.stringify(payload));
};

const extractToken = (req) => {
  const cookies = parseCookies(req);
  return cookies[COOKIE_NAME];
};

const ensureAuthorized = (req, res) => {
  const token = extractToken(req);
  if (!validateSession(token)) {
    sendJson(res, { message: 'Yetkisiz erisim' }, 401);
    return null;
  }
  return token;
};

module.exports = {
  COOKIE_NAME,
  ensureAuthorized,
  parseCookies,
  sendJson,
  extractToken,
};
