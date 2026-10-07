import { db } from "../src/db";
import { users } from "../src/db/schema";
import { hash } from "bcryptjs";

async function main() {
  const email = "kasialaciak.gallery@gmail.com";
  const password = "KasiaLaciak1987.";
  const hashedPassword = await hash(password, 10);

  try {
    await db.insert(users).values({
      name: "Kasia Laciak",
      email,
      password: hashedPassword,
      role: "admin",
    });
    console.log("Admin user created successfully.");
  } catch (err) {
    console.error("Error creating admin user:", err);
  }
}

main().catch(console.error);
