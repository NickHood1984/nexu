import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index.js";

const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://nexu:nexu@localhost:5433/nexu_dev";

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });
export type Database = typeof db;
