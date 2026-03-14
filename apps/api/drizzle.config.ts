import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL!;
const productionEndpoint = process.env.NEON_PRODUCTION_ENDPOINT;

if (productionEndpoint && databaseUrl.includes(productionEndpoint)) {
  throw new Error(
    "BLOCKED: Cannot run drizzle-kit against production locally.\n" +
      "Switch to a dev branch first: bun run db:branch <branch-name>\n" +
      "Production migrations run via CI/CD (GitHub Actions) on push to main."
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
