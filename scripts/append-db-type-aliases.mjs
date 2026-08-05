/** Append project helper aliases after `supabase gen types`. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "..", "types", "database.types.ts");
let source = fs.readFileSync(file, "utf8");

const marker = 'export type UserRole = Enums<"user_role">;';
if (source.includes(marker)) {
  process.exit(0);
}

const helpers = `
export type UserRole = Enums<"user_role">;
export type StaffStatus = Enums<"staff_status">;
export type StaffDepartment = Enums<"staff_department">;
export type ApplicationType = Enums<"application_type">;
export type ApplicationStatus = Enums<"application_status">;
export type ApplicationPriority = Enums<"application_priority">;
export type CreatorStatus = Enums<"creator_status">;
export type FinanceTransactionStatus = Enums<"finance_transaction_status">;
export type FinancePaymentMethod = Enums<"finance_payment_method">;
export type PlatformLinkStatus = Enums<"platform_link_status">;
export type CabinetTaskStatus = Enums<"cabinet_task_status">;
export type CabinetTaskPriority = Enums<"cabinet_task_priority">;
export type PayoutStatus = Enums<"payout_status">;
export type PayoutMethod = Enums<"payout_method">;
export type CreatorDocumentType = Enums<"creator_document_type">;
export type SupportTicketStatus = Enums<"support_ticket_status">;
`;

source = `${source.trimEnd()}\n${helpers}`;
fs.writeFileSync(file, source.endsWith("\n") ? source : `${source}\n`);
