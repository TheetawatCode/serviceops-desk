import { cleanE2EJobs } from "./support/database";

export default async function globalTeardown() {
  await cleanE2EJobs();
}
