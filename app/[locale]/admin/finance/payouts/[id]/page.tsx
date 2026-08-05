import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import { Link, redirect } from "@/i18n/navigation";
import { getFinancePayout } from "@/features/finance/payouts";
import MoneyCell from "@/features/finance/transactions/components/MoneyCell";
import Badge from "@/shared/ui/Badge";
import type { PayoutStatus } from "@/features/finance/types";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

function tone(status: PayoutStatus) {
  if (status === "completed") return "success" as const;
  if (status === "pending") return "warning" as const;
  if (status === "processing") return "info" as const;
  return "danger" as const;
}

export default async function AdminFinancePayoutDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const session = await requireStaff();
  const t = await getTranslations("admin.finance");

  if (!hasPermission(session.profile.role, "finance.read")) {
    redirect({ href: "/admin", locale });
  }

  let payout;
  try {
    payout = await getFinancePayout(id);
  } catch (error) {
    console.error(error);
    return (
      <div className="rounded-[var(--nht-radius-xl)] border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-sm text-[var(--nht-text-secondary)]">
        {t("errors.load")}
      </div>
    );
  }

  if (!payout) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/finance?tab=payouts"
        className="text-xs text-[var(--nht-text-tertiary)] hover:text-[var(--nht-accent)]"
      >
        {t("backToList")}
      </Link>

      <div className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-overline text-[var(--nht-gold)]">{t("payoutsTitle")}</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              {payout.creator?.display_name ||
                payout.creator?.full_name ||
                t("none")}
            </h1>
          </div>
          <Badge tone={tone(payout.status)}>
            {t(`payoutStatus.${payout.status}`)}
          </Badge>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] text-[var(--nht-text-tertiary)]">
              {t("payoutsTable.amount")}
            </dt>
            <dd className="mt-1 text-white">
              <MoneyCell
                value={payout.amount}
                locale={locale}
                currency={payout.currency}
              />
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-[var(--nht-text-tertiary)]">
              {t("payoutsTable.method")}
            </dt>
            <dd className="mt-1 text-white">
              {t(`payoutMethods.${payout.method}`)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-[var(--nht-text-tertiary)]">
              {t("payoutsTable.requested")}
            </dt>
            <dd className="mt-1 text-[var(--nht-text-secondary)]">
              {payout.requested_at ?? payout.created_at}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-[var(--nht-text-tertiary)]">
              {t("payoutsTable.approved")}
            </dt>
            <dd className="mt-1 text-[var(--nht-text-secondary)]">
              {payout.approved_at ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-[var(--nht-text-tertiary)]">
              {t("payoutsTable.paid")}
            </dt>
            <dd className="mt-1 text-[var(--nht-text-secondary)]">
              {payout.paid_at ?? "—"}
            </dd>
          </div>
          {payout.rejection_reason ? (
            <div className="sm:col-span-2">
              <dt className="text-[11px] text-[var(--nht-text-tertiary)]">
                {t("payoutActions.rejectReason")}
              </dt>
              <dd className="mt-1 text-red-300">{payout.rejection_reason}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </div>
  );
}
