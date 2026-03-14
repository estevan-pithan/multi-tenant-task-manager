import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

export async function authMiddleware(c: Context, next: Next) {
  const authorization = c.req.header("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Missing or invalid Authorization header" });
  }

  const token = authorization.slice(7);

  const tenantTokens: Record<string, string> = {
    [c.env.TENANT_A_TOKEN]: "tenant_a",
    [c.env.TENANT_B_TOKEN]: "tenant_b",
  };

  const tenantId = tenantTokens[token];

  if (!tenantId) {
    throw new HTTPException(401, { message: "Invalid token" });
  }

  c.set("tenantId", tenantId);
  await next();
}
