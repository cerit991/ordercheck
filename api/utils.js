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

module.exports = {
  parseJsonBody,
};
