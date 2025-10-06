const crypto = require("crypto");

const GITHUB_SECRET = process.env.GITHUB_WEBHOOK_SECRET; // same value you set in GitHub

function isValidSignature(sig256, rawBody) {
  if (!sig256) return false;
  const hmac = crypto.createHmac("sha256", GITHUB_SECRET);
  const digest = "sha256=" + hmac.update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(sig256), Buffer.from(digest));
}

module.exports = { isValidSignature };
