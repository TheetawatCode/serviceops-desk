import { execFileSync } from "node:child_process";

import { cleanE2EJobs } from "./support/database";

export default async function globalSetup() {
  execFileSync("pnpm", ["db:seed"], { stdio: "inherit" });
  await cleanE2EJobs();
}
