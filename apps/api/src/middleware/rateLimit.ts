import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const MAX_REQUESTS = 10;
const WINDOW_MS = 60_000;

export async function rateLimitMiddleware(c: Context, next: Next) {
  const tenantId = c.get("tenantId") as string;
  const now = Date.now();

  const entry = rateLimitMap.get(tenantId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(tenantId, { count: 1, resetAt: now + WINDOW_MS });
    await next();
    return;
  }

  if (entry.count >= MAX_REQUESTS) {
    throw new HTTPException(429, { message: "Too many requests" });
  }

  entry.count++;
  await next();
}
