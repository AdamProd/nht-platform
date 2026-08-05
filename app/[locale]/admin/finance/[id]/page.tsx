import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { requireStaff, isAdminOrAbove } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import { listActiveFinanceManagers } from "@/features/finance/transactions/queries/list-finance-managers";
import { getFinanceTransaction } from "@/features/finance/transactions/queries/get-transaction";
import { listFinanceCreators } from "@/features/finance/reports/queries/get-finance-dashboard";
import TransactionDetailPanel from "@/features/finance/transactions/components/TransactionDetailPanel";
import type {
  FinancePaymentMethod,
  FinancePlatform,
  FinanceTransactionStatus,
} from "@/features/finance/types";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminFinanceDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const session = await requireStaff();
  const t = await getTranslations("admin.finance");
  const tUx = await getTranslations("common.ux");

  if (!hasPermission(session.profile.role, "finance.read")) {
    redirect({ href: "/admin", locale });
  }

  const canAssignManager = isAdminOrAbove(session.profile.role);
  const canDelete = hasPermission(session.profile.role, "finance.delete");

  let transaction;
  let creators;
  let managers;

  try {
    [transaction, creators, managers] = await Promise.all([
      getFinanceTransaction(id),
      listFinanceCreators(),
      listActiveFinanceManagers(),
    ]);
  } catch (error) {
    console.error(error);
    return (
      <div className="rounded-[var(--nht-radius-xl)] border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-sm text-[var(--nht-text-secondary)]">
        {t("errors.loadDetail")}
      </div>
    );
  }

  if (!transaction) notFound();

  const statusLabels = {
    pending: t("status.pending"),
    approved: t("status.approved"),
    paid: t("status.paid"),
    cancelled: t("status.cancelled"),
    disputed: t("status.disputed"),
  } satisfies Record<FinanceTransactionStatus, string>;

  const platformLabels = {
    onlyfans: t("platforms.onlyfans"),
    fansly: t("platforms.fansly"),
    chaturbate: t("platforms.chaturbate"),
    instagram: t("platforms.instagram"),
    tiktok: t("platforms.tiktok"),
    twitter: t("platforms.twitter"),
    other: t("platforms.other"),
  } satisfies Record<FinancePlatform, string>;

  const methodLabels = {
    stripe: t("methods.stripe"),
    wise: t("methods.wise"),
    paypal: t("methods.paypal"),
    crypto: t("methods.crypto"),
    bank_transfer: t("methods.bankTransfer"),
    other: t("methods.other"),
  } satisfies Record<FinancePaymentMethod, string>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-overline text-[var(--nht-gold)]">
            {t("detailLabel")}
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            {transaction.creator?.display_name ||
              transaction.creator?.full_name ||
              t("title")}
          </h1>
        </div>
        <Link
          href="/admin/finance"
          className="text-xs text-[var(--nht-text-tertiary)] hover:text-[var(--nht-gold)]"
        >
          ← {t("backToList")}
        </Link>
      </div>

      <TransactionDetailPanel
        transaction={transaction}
        creators={creators}
        managers={managers}
        canAssignManager={canAssignManager}
        canDelete={canDelete}
        locale={locale}
        labels={{
          sections: {
            details: t("sections.details"),
            status: t("sections.status"),
            notes: t("sections.notes"),
            meta: t("sections.meta"),
          },
          fields: {
            creator: t("fields.creator"),
            manager: t("fields.manager"),
            platform: t("fields.platform"),
            date: t("fields.date"),
            gross: t("fields.gross"),
            currency: t("fields.currency"),
            agencyPercent: t("fields.agencyPercent"),
            agencyAmount: t("fields.agencyAmount"),
            creatorPercent: t("fields.creatorPercent"),
            creatorAmount: t("fields.creatorAmount"),
            status: t("fields.status"),
            paymentMethod: t("fields.paymentMethod"),
            referenceId: t("fields.referenceId"),
            notes: t("fields.notes"),
            created: t("fields.created"),
            updated: t("fields.updated"),
            unassigned: t("unassigned"),
            none: t("none"),
          },
          save: t("actions.save"),
          saving: t("actions.saving"),
          saved: t("toast.saved"),
          saveError: t("actions.saveError"),
          delete: t("actions.delete"),
          deleting: t("actions.deleting"),
          deleted: t("toast.deleted"),
          confirmDelete: t("actions.confirmDelete"),
          cancel: tUx("cancel"),
        }}
        statusLabels={statusLabels}
        platformLabels={platformLabels}
        methodLabels={methodLabels}
      />
    </div>
  );
}
