import { getTranslations, setRequestLocale } from "next-intl/server";
import { listTickets } from "@/features/cabinet/queries/cabinet";
import {
  SupportCreateForm,
  TicketListLink,
} from "@/features/cabinet/dashboard/CabinetForms";

type Props = { params: Promise<{ locale: string }> };

export default async function CreatorSupportPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("creator.support");
  const tRoot = await getTranslations("creator");
  const { tickets } = await listTickets();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-overline text-[var(--nht-gold)]">{t("label")}</p>
        <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-[var(--nht-text-secondary)]">
          {t("description")}
        </p>
      </div>

      <SupportCreateForm
        labels={{
          create: {
            title: t("create.title"),
            subject: t("create.subject"),
            message: t("create.message"),
            submit: t("create.submit"),
            submitting: t("create.submitting"),
          },
          toastCreated: tRoot("toast.ticketCreated"),
          saveError: tRoot("actionErrors.save"),
        }}
      />

      {tickets.length === 0 ? (
        <p className="text-sm text-[var(--nht-text-secondary)]">{t("empty")}</p>
      ) : (
        <div className="overflow-x-auto rounded-[var(--nht-radius-xl)] border border-white/[0.06]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/[0.06] bg-white/[0.02]">
              <tr className="text-overline text-[var(--nht-text-tertiary)]">
                <th className="px-4 py-3 font-medium">{t("table.subject")}</th>
                <th className="px-4 py-3 font-medium">{t("table.status")}</th>
                <th className="px-4 py-3 font-medium">{t("table.updated")}</th>
                <th className="px-4 py-3 font-medium">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-white/[0.04]">
                  <td className="px-4 py-3 text-white">{ticket.subject}</td>
                  <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                    {t(`status.${ticket.status}`)}
                  </td>
                  <td className="px-4 py-3 text-[var(--nht-text-tertiary)]">
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(ticket.last_message_at))}
                  </td>
                  <td className="px-4 py-3">
                    <TicketListLink id={ticket.id}>
                      {t("table.actions")}
                    </TicketListLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
