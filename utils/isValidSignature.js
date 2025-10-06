const crypto = require("crypto");

function isValidSignature(sig256, rawBody, secret) {
  if (!secret) return false; // don’t call createHmac with undefined
  if (!sig256 || !rawBody) return false;

  const hmac = crypto.createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(sig256), Buffer.from(digest));
  } catch {
    return false;
  }
}

module.exports = isValidSignature;
