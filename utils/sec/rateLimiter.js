const rateLimit = require("express-rate-limit");

/**
 * Create a configured rate limiter middleware.
 * Why: expose clear defaults + safe headers; allow overrides.
 *
 * @param {Object} [opts]
 * @param {number} [opts.windowMs=15*60*1000]
 * @param {number} [opts.limit=100] - requests per window per IP/subnet
 * @param {number} [opts.ipv6Subnet=56] - aggregation granularity for IPv6
 * @returns {import('express').RequestHandler}
 */

function createRateLimiter(opts = {}) {
  const {
    windowMs = 15 * 60 * 1000,
    limit = 100,
    ipv6Subnet = 56,
    ...rest
  } = opts;

  const normalizedLimit =
    Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 100; // if no limit provided it sets as 100

  return rateLimit({
    windowMs,
    limit: normalizedLimit,
    ipv6Subnet,
    standardHeaders: true, // Why: expose rate-limit info via RFC headers
    legacyHeaders: false, // Why: avoid deprecated X-RateLimit-* headers
    /**
     * Custom handler for blocked requests.
     * Why: dynamic message + proper Retry-After.
     */
    handler: (req, res /*, next, options*/) => {
      // express-rate-limit v6 populates req.rateLimit
      const now = Date.now();

      const resetTimeMs =
        req.rateLimit?.resetTime instanceof Date // is req.rateLimit exists? if yes check if its an instance of type Date
          ? req.rateLimit.resetTime.getTime() // if yes, use this as resetTimeMs
          : now + windowMs; // Fallback if store doesn't provide resetTime

      // Retry-After is in seconds
      const retryAfterSec = Math.max(1, Math.ceil((resetTimeMs - now) / 1000)); //resetTimeMs-now ~=15,000
      res.set("Retry-After", String(retryAfterSec));

      const minutes = Math.ceil(retryAfterSec / 60);

      res.status(429).json({
        error: "Too many requests",
        detail: `Try again in ~${minutes} minute${minutes > 1 ? "s" : ""}.`,
        limit: normalizedLimit,
        windowMs,
      });
    },
    // Allow further tuning via opts (e.g., keyGenerator, skipSuccessfulRequests)
    ...rest,
  });
}

module.exports = { createRateLimiter };
