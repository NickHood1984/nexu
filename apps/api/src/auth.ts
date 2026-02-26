import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import pg from "pg";

const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://nexu:nexu@localhost:5433/nexu_dev";

const options: BetterAuthOptions = {
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: new pg.Pool({ connectionString: databaseUrl }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  trustedOrigins: [process.env.WEB_URL ?? "http://localhost:5173"],
};

export const auth = betterAuth(options);
