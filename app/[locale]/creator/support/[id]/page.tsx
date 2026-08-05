import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getTicket } from "@/features/cabinet/queries/cabinet";
import { SupportThread } from "@/features/cabinet/components/CabinetForms";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function CreatorSupportTicketPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("creator.support");
  const tRoot = await getTranslations("creator");
  const { ticket, messages } = await getTicket(id);
  if (!ticket) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-overline text-[var(--nht-gold)]">{t("label")}</p>
          <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            {ticket.subject}
          </h1>
          <p className="mt-2 text-sm text-[var(--nht-text-secondary)]">
            {t(`status.${ticket.status}`)}
          </p>
        </div>
        <Link
          href="/creator/support"
          className="text-xs text-[var(--nht-text-tertiary)] hover:text-[var(--nht-gold)]"
        >
          ← {t("title")}
        </Link>
      </div>
      <SupportThread
        ticketId={ticket.id}
        messages={messages}
        labels={{
          reply: t("thread.reply"),
          send: t("thread.send"),
          sending: t("thread.sending"),
          empty: t("thread.empty"),
          you: t("thread.you"),
          staff: t("thread.staff"),
          saved: tRoot("toast.saved"),
          saveError: tRoot("actionErrors.save"),
        }}
      />
    </div>
  );
}
