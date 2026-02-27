import cron from "node-cron";
import { deleteOldAuditLogs } from "../services/auditServices.js";

/**
 * Runs every day at 2 AM
 */
export function startAuditLogCleanupCron() {
  cron.schedule("0 20 */14 * *", async () => {
    console.log("⏰ Running Audit Log Cleanup Cron");

    await deleteOldAuditLogs();
  });
}

export default startAuditLogCleanupCron;