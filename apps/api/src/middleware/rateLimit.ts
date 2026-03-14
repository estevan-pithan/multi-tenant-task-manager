import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

const MAX_REQUESTS = 10;
const WINDOW_MS = 60_000;
const CLEANUP_INTERVAL = 60_000;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

export async function rateLimitMiddleware(c: Context, next: Next) {
  const tenantId = c.get("tenantId") as string;
  const now = Date.now();

  cleanup();

  let entry = rateLimitMap.get(tenantId);

  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + WINDOW_MS };
    rateLimitMap.set(tenantId, entry);
  } else {
    entry.count++;
  }

  const remaining = Math.max(0, MAX_REQUESTS - entry.count);

  c.header("X-RateLimit-Limit", String(MAX_REQUESTS));
  c.header("X-RateLimit-Remaining", String(remaining));
  c.header("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

  if (entry.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    c.header("Retry-After", String(retryAfter));
    throw new HTTPException(429, { message: "Too many requests" });
  }

  await next();
}

export function _resetForTesting() {
  rateLimitMap.clear();
  lastCleanup = Date.now();
}
