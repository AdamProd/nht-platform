import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPayout } from "@/features/cabinet/queries/cabinet";
import { formatMoney } from "@/features/creators/lib/format";
import PrintReceiptButton from "@/features/cabinet/components/PrintReceiptButton";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function CreatorPayoutReceiptPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("creator.payouts");
  const { creator, payout } = await getPayout(id);
  if (!payout) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6 print:max-w-none">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <h1 className="text-xl font-semibold text-white">{t("actions.exportPdf")}</h1>
        <PrintReceiptButton label={t("actions.exportPdf")} />
      </div>
      <article className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-8 text-white print:border-black print:bg-white print:text-black">
        <p className="text-overline text-[var(--nht-gold)] print:text-black">NHT</p>
        <h2 className="mt-4 text-2xl font-semibold">{creator.display_name}</h2>
        <p className="mt-2 text-sm text-[var(--nht-text-secondary)] print:text-neutral-600">
          {payout.receipt_number || payout.id}
        </p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-overline text-[var(--nht-text-tertiary)] print:text-neutral-500">
              {t("table.period")}
            </dt>
            <dd className="mt-2 text-sm">
              {payout.period_start} → {payout.period_end}
            </dd>
          </div>
          <div>
            <dt className="text-overline text-[var(--nht-text-tertiary)] print:text-neutral-500">
              {t("table.amount")}
            </dt>
            <dd className="mt-2 text-sm">
              {formatMoney(payout.amount, locale, payout.currency)}
            </dd>
          </div>
          <div>
            <dt className="text-overline text-[var(--nht-text-tertiary)] print:text-neutral-500">
              {t("table.status")}
            </dt>
            <dd className="mt-2 text-sm">{t(`status.${payout.status}`)}</dd>
          </div>
          <div>
            <dt className="text-overline text-[var(--nht-text-tertiary)] print:text-neutral-500">
              {t("table.method")}
            </dt>
            <dd className="mt-2 text-sm">{t(`method.${payout.method}`)}</dd>
          </div>
        </dl>
      </article>
    </div>
  );
}
