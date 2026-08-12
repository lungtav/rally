import fs from "node:fs/promises";
import path from "node:path";
import { pool } from "../config/database.js";

const migrationsDirectory = path.join(process.cwd(), "migrations");

async function migrate() {
  console.log("Starting database migration...");

  await pool.query(`
        CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `);

  const files = (await fs.readdir(migrationsDirectory))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    // Check if this migration has already been applied
    const result = await pool.query(
      `
            SELECT 1
            FROM migrations
            WHERE name = $1
            `,
      [file],
    );

    if (result.rowCount && result.rowCount > 0) {
      console.log(`Skipping ${file} - already applied`);
      continue;
    }

    console.log(`Applying ${file}...`);

    // Read the SQL file
    const sql = await fs.readFile(path.join(migrationsDirectory, file), "utf8");

    // Use a dedicated client so the migration is transactional
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Execute the migration SQL
      await client.query(sql);

      // Record the migration only if the SQL succeeded
      await client.query(
        `
                INSERT INTO migrations (name)
                VALUES ($1)
                `,
        [file],
      );

      await client.query("COMMIT");

      console.log(`✓ Applied ${file}`);
    } catch (error) {
      await client.query("ROLLBACK");

      console.error(`✗ Failed to apply ${file}`);

      throw error;
    } finally {
      client.release();
    }
  }

  console.log("Database migration completed.");

  await pool.end();
}

migrate().catch((error) => {
  console.error("Migration failed:");
  console.error(error);

  process.exit(1);
});
