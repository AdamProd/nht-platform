import type { NewApplicationNotification } from "./types";

function getTelegramConfig(): { token: string; chatId: string } | null {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();

  if (!token || !chatId) {
    return null;
  }

  return { token, chatId };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatApplicationMessage(payload: NewApplicationNotification): string {
  const lines = [
    "<b>New NHT application</b>",
    "",
    `<b>Name:</b> ${escapeHtml(payload.fullName)}`,
    `<b>Email:</b> ${escapeHtml(payload.email)}`,
    `<b>Platform:</b> ${escapeHtml(payload.platform)}`,
    `<b>Locale:</b> ${escapeHtml(payload.locale)}`,
    `<b>Type:</b> ${escapeHtml(payload.type ?? "creator")}`,
    "",
    "<b>Message:</b>",
    escapeHtml(payload.message),
    "",
    `<b>ID:</b> <code>${escapeHtml(payload.id)}</code>`,
  ];

  return lines.join("\n");
}

/**
 * Sends a Telegram notification for a new application.
 * Never throws — failures are logged so form submission stays intact.
 */
export async function notifyNewApplication(
  payload: NewApplicationNotification,
): Promise<boolean> {
  const config = getTelegramConfig();

  if (!config) {
    console.error(
      "[telegram] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID — notification skipped.",
    );
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${config.token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: formatApplicationMessage(payload),
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      console.error(
        `[telegram] sendMessage failed (${response.status}): ${body}`,
      );
      return false;
    }

    const result = (await response.json()) as { ok?: boolean; description?: string };

    if (!result.ok) {
      console.error(
        `[telegram] API returned ok=false: ${result.description ?? "unknown error"}`,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("[telegram] Failed to send notification:", error);
    return false;
  }
}
