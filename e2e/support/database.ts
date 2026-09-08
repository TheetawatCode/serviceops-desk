import "dotenv/config";

import { Pool } from "pg";

export const E2E_JOB_TITLE_PREFIX = "[E2E]";

export async function cleanE2EJobs() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for E2E cleanup.");

  const pool = new Pool({ connectionString });
  try {
    await pool.query('DELETE FROM "ServiceJob" WHERE title LIKE $1', [
      `${E2E_JOB_TITLE_PREFIX}%`,
    ]);
  } finally {
    await pool.end();
  }
}
