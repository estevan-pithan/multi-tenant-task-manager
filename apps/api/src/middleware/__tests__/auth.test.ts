import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authMiddleware } from "../auth";

function createApp() {
  const app = new Hono<{
    Bindings: { TENANT_A_TOKEN: string; TENANT_B_TOKEN: string };
    Variables: { tenantId: string };
  }>();

  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json({ error: err.message }, err.status);
    }
    return c.json({ error: "Internal server error" }, 500);
  });

  app.use("*", authMiddleware);
  app.get("/test", (c) => c.json({ tenantId: c.get("tenantId") }));

  return app;
}

const env = {
  TENANT_A_TOKEN: "token-tenant-a",
  TENANT_B_TOKEN: "token-tenant-b",
};

describe("authMiddleware", () => {
  const app = createApp();

  it("returns 401 when Authorization header is missing", async () => {
    const res = await app.request("/test", {}, env);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Missing or invalid Authorization header" });
  });

  it("returns 401 when Authorization header does not start with Bearer", async () => {
    const res = await app.request(
      "/test",
      { headers: { Authorization: "Basic some-token" } },
      env,
    );
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Missing or invalid Authorization header" });
  });

  it("returns 401 when token is invalid", async () => {
    const res = await app.request(
      "/test",
      { headers: { Authorization: "Bearer invalid-token" } },
      env,
    );
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Invalid token" });
  });

  it("sets tenantId to tenant_a for valid tenant A token", async () => {
    const res = await app.request(
      "/test",
      { headers: { Authorization: "Bearer token-tenant-a" } },
      env,
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ tenantId: "tenant_a" });
  });

  it("sets tenantId to tenant_b for valid tenant B token", async () => {
    const res = await app.request(
      "/test",
      { headers: { Authorization: "Bearer token-tenant-b" } },
      env,
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ tenantId: "tenant_b" });
  });

  it("tenant_a token never resolves to tenant_b", async () => {
    const res = await app.request(
      "/test",
      { headers: { Authorization: "Bearer token-tenant-a" } },
      env,
    );
    const body = (await res.json()) as { tenantId: string };
    expect(body.tenantId).toBe("tenant_a");
    expect(body.tenantId).not.toBe("tenant_b");
  });
});
