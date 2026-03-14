import { describe, it, expect, beforeEach, vi } from "vitest";
import { Hono } from "hono";
import { rateLimitMiddleware } from "../rateLimit";

function createApp() {
  const app = new Hono<{ Variables: { tenantId: string } }>();

  app.use("*", async (c, next) => {
    c.set("tenantId", c.req.header("X-Tenant-Id") ?? "tenant_a");
    await next();
  });

  app.post("/test", rateLimitMiddleware, (c) => c.json({ ok: true }));

  return app;
}

function makeRequest(app: ReturnType<typeof createApp>, tenantId = "tenant_a") {
  return app.request("/test", {
    method: "POST",
    headers: { "X-Tenant-Id": tenantId },
  });
}

describe("rateLimitMiddleware", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp();
    vi.restoreAllMocks();
  });

  it("allows up to 10 requests from the same tenant", async () => {
    for (let i = 0; i < 10; i++) {
      const res = await makeRequest(app);
      expect(res.status).toBe(200);
    }
  });

  it("returns 429 on the 11th request", async () => {
    for (let i = 0; i < 10; i++) {
      await makeRequest(app);
    }
    const res = await makeRequest(app);
    expect(res.status).toBe(429);
  });

  it("different tenants have independent counters", async () => {
    for (let i = 0; i < 10; i++) {
      await makeRequest(app, "tenant_a");
    }

    const res = await makeRequest(app, "tenant_b");
    expect(res.status).toBe(200);
  });
});
