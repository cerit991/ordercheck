module.exports = (req, res) => {
  const senderEmail = process.env.SENDER_EMAIL || '';
  const recipientEmail = process.env.RECIPIENT_EMAIL || '';
  const senderPassword = process.env.SENDER_PASSWORD || '';

  const payload = {
    senderEmail,
    recipientEmail,
    mailConfigured: Boolean(senderEmail && recipientEmail && senderPassword)
  };

  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
};
