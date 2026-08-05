export type { CabinetActionResult, CabinetPlatform, StatRange } from "@/features/cabinet/types";

export { CABINET_PLATFORMS, STAT_RANGES, rangeToDays } from "@/features/cabinet/types";

export {
  getCabinetCreator,
  getDashboardData,
  listPlatformAccounts,
  listTasks,
  listTickets,
  getTicket,
  listDocuments,
  listPayouts,
  getPayout,
  getStats,
  getSettings,
} from "@/features/cabinet/queries/cabinet";

export {
  updateCreatorProfile,
  updatePlatformAccount,
  completeTask,
  createSupportTicket,
  replySupportTicket,
  uploadDocument,
  deleteDocument,
  updateCreatorSettings,
} from "@/features/cabinet/profile/actions/cabinet";

export {
  startImpersonation,
  stopImpersonation,
} from "@/features/cabinet/impersonation/actions/impersonation";
