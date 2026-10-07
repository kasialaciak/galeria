import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import fs from "fs";
import path from "path";

config({ path: ".env.local" });
config({ path: ".env" });

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ Brak DATABASE_URL w .env.local!");
    process.exit(1);
  }

  const fileArg = process.argv[2] || path.join("drizzle", "0000_cuddly_luminals.sql");
  const sqlFilePath = path.resolve(process.cwd(), fileArg);

  console.log("🚀 Łączenie z bazą Neon...");
  const sql = neon(connectionString);

  const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");

  // Instrukcje oddzielone znacznikiem "--> statement-breakpoint"
  const statements = sqlContent
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`📦 ${path.basename(sqlFilePath)}: ${statements.length} instrukcji SQL do wykonania.`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await (sql as any).query(stmt);
      console.log(`[${i + 1}/${statements.length}] Sukces`);
    } catch (err: any) {
      // Ignorujemy błędy jeśli tabela/relacja już istnieje
      if (err.message && (err.message.includes("already exists") || err.message.includes("już istnieje"))) {
        console.log(`[${i + 1}/${statements.length}] Już istnieje (pomijam)`);
      } else {
        console.error(`❌ Błąd w zapytaniu: ${stmt.substring(0, 60)}...`, err.message);
        process.exit(1);
      }
    }
  }

  console.log("✅ Migracja zakończona.");
}

runMigration().catch((err) => {
  console.error("Błąd migracji:", err);
  process.exit(1);
});
