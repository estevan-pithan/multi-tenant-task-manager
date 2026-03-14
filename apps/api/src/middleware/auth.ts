import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

const TENANT_TOKENS: Record<string, string> = {
  "token-tenant-a": "tenant_a",
  "token-tenant-b": "tenant_b",
};

export async function authMiddleware(c: Context, next: Next) {
  const authorization = c.req.header("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Missing or invalid Authorization header" });
  }

  const token = authorization.slice(7);
  const tenantId = TENANT_TOKENS[token];

  if (!tenantId) {
    throw new HTTPException(401, { message: "Invalid token" });
  }

  c.set("tenantId", tenantId);
  await next();
}
