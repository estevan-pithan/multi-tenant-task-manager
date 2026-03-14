import { describe, it, expect, beforeEach, vi } from "vitest";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { rateLimitMiddleware, _resetForTesting } from "../rateLimit";

function createApp() {
  const app = new Hono<{ Variables: { tenantId: string } }>();

  app.use("*", async (c, next) => {
    c.set("tenantId", c.req.header("X-Tenant-Id") ?? "tenant_a");
    await next();
  });

  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json({ error: err.message }, err.status);
    }
    return c.json({ error: "Internal server error" }, 500);
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
  beforeEach(() => {
    _resetForTesting();
    vi.restoreAllMocks();
  });

  it("allows up to 10 requests from the same tenant", async () => {
    const app = createApp();
    for (let i = 0; i < 10; i++) {
      const res = await makeRequest(app);
      expect(res.status).toBe(200);
    }
  });

  it("returns 429 on the 11th request", async () => {
    const app = createApp();
    for (let i = 0; i < 10; i++) {
      await makeRequest(app);
    }
    const res = await makeRequest(app);
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "Too many requests" });
  });

  it("different tenants have independent counters", async () => {
    const app = createApp();
    for (let i = 0; i < 10; i++) {
      await makeRequest(app, "tenant_a");
    }
    const blocked = await makeRequest(app, "tenant_a");
    expect(blocked.status).toBe(429);

    const res = await makeRequest(app, "tenant_b");
    expect(res.status).toBe(200);
  });

  it("includes X-RateLimit headers on successful responses", async () => {
    const app = createApp();
    const res = await makeRequest(app);

    expect(res.headers.get("X-RateLimit-Limit")).toBe("10");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("9");
    expect(res.headers.get("X-RateLimit-Reset")).toBeTruthy();
  });

  it("decrements X-RateLimit-Remaining correctly", async () => {
    const app = createApp();

    const res1 = await makeRequest(app);
    expect(res1.headers.get("X-RateLimit-Remaining")).toBe("9");

    const res2 = await makeRequest(app);
    expect(res2.headers.get("X-RateLimit-Remaining")).toBe("8");

    const res3 = await makeRequest(app);
    expect(res3.headers.get("X-RateLimit-Remaining")).toBe("7");
  });

  it("includes Retry-After header on 429 responses", async () => {
    const app = createApp();
    for (let i = 0; i < 10; i++) {
      await makeRequest(app);
    }
    const res = await makeRequest(app);

    expect(res.status).toBe(429);
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");

    const retryAfter = Number(res.headers.get("Retry-After"));
    expect(retryAfter).toBeGreaterThan(0);
  });

  it("resets counter after window expires", async () => {
    vi.useFakeTimers();
    const app = createApp();

    for (let i = 0; i < 10; i++) {
      await makeRequest(app);
    }
    const blocked = await makeRequest(app);
    expect(blocked.status).toBe(429);

    vi.advanceTimersByTime(60_001);

    const allowed = await makeRequest(app);
    expect(allowed.status).toBe(200);

    vi.useRealTimers();
  });
});
