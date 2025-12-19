const crypto = require('crypto');

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const sessions = new Map();

const createSession = () => {
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  sessions.set(token, { expiresAt });
  return token;
};

const validateSession = (token) => {
  if (!token) {
    return false;
  }

  const session = sessions.get(token);
  if (!session) {
    return false;
  }

  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return false;
  }

  return true;
};

const deleteSession = (token) => {
  if (!token) {
    return;
  }

  sessions.delete(token);
};

module.exports = {
  createSession,
  validateSession,
  deleteSession,
};
