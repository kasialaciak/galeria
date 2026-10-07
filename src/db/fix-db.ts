import { neon } from "@neondatabase/serverless";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not found, skipping db fix script.");
    process.exit(0);
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log("Applying unique constraint to coupons table if it doesn't exist...");
    await sql`ALTER TABLE coupons ADD CONSTRAINT coupons_code_unique UNIQUE (code);`;
    console.log("Successfully added constraint coupons_code_unique.");
  } catch (error: any) {
    console.log("Constraint might already exist or error:", error.message);
  }
}
main();
