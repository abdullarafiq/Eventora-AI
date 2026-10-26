import { Request, Response, NextFunction } from 'express'

interface RateLimitRecord {
  count: number
  resetTime: number
}

const WINDOW_MS = 60 * 1000 // 1 minute window
const MAX_REQUESTS = 40 // 40 requests per minute

const ipStore = new Map<string, RateLimitRecord>()

// Periodic cleanup of expired IPs
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of ipStore.entries()) {
    if (now > record.resetTime) {
      ipStore.delete(ip)
    }
  }
}, WINDOW_MS)

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip'
  const now = Date.now()

  let record = ipStore.get(clientIp)
  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + WINDOW_MS
    }
    ipStore.set(clientIp, record)
  } else {
    record.count++
  }

  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS)
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - record.count))

  if (record.count > MAX_REQUESTS) {
    res.status(429).json({
      error: 'Too many requests. Please wait a moment before asking AI again.',
      retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000)
    })
    return
  }

  next()
}
