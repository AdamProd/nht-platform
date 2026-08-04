export { createClient as createBrowserClient } from "./client";
export { createClient as createServerClient } from "./server";
export { createAdminClient } from "./admin";
export { updateSession } from "./middleware";
export {
  getSupabaseClientEnv,
  getSupabaseServerEnv,
  hasSupabaseEnv,
} from "./env";
export {
  APPLICATIONS_BUCKET,
  APPLICATION_FILE_CATEGORIES,
  applicationStoragePath,
  type ApplicationFileCategory,
} from "./storage";
