const windows = new Map();

module.exports = function nursingRateLimit({ windowMs = 60_000, max = 30 } = {}) {
  return (req, res, next) => {
    const identity = req.userId ? String(req.userId) : req.ip;
    const key = `${req.baseUrl}:${identity}`;
    const now = Date.now();
    const current = windows.get(key);
    if (!current || current.resetAt <= now) {
      windows.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    current.count += 1;
    if (current.count > max) {
      res.set('Retry-After', String(Math.ceil((current.resetAt - now) / 1000)));
      return res.status(429).json({ success: false, message: 'Too many requests. Please try again shortly.' });
    }
    return next();
  };
};
