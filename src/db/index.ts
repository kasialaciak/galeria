import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function sanitizeDatabaseUrl(raw?: string): string {
  if (!raw) return "";
  let clean = raw.trim().replace(/^["']|["']$/g, "");
  clean = clean
    .replace("channel_binding=require&", "")
    .replace("&channel_binding=require", "")
    .replace("?channel_binding=require", "?");
  return clean;
}

const connectionString = sanitizeDatabaseUrl(process.env.DATABASE_URL);
const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
