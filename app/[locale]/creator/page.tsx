import { getTranslations, setRequestLocale } from "next-intl/server";
import { getDashboardData } from "@/features/cabinet/queries/cabinet";
import { formatMoney } from "@/features/creators/lib/format";

type Props = { params: Promise<{ locale: string }> };

export default async function CreatorDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("creator.dashboard");

  let data;
  try {
    data = await getDashboardData();
  } catch (error) {
    console.error(error);
    return (
      <div className="rounded-[var(--nht-radius-xl)] border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-sm text-[var(--nht-text-secondary)]">
        {t("empty")}
      </div>
    );
  }

  const cards = [
    ["currentRevenue", formatMoney(data.cards.currentRevenue, locale)],
    ["lifetimeRevenue", formatMoney(data.cards.lifetimeRevenue, locale)],
    ["pendingPayout", formatMoney(data.cards.pendingPayout, locale)],
    ["completedTasks", String(data.cards.completedTasks)],
    ["unreadMessages", String(data.cards.unreadMessages)],
    ["upcomingDeadlines", String(data.cards.upcomingDeadlines)],
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-overline text-[var(--nht-gold)]">{t("label")}</p>
        <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-[var(--nht-text-secondary)]">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([key, value]) => (
          <div
            key={key}
            className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <p className="text-overline text-[var(--nht-text-tertiary)]">
              {t(`cards.${key}`)}
            </p>
            <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02]">
        <div className="border-b border-white/[0.06] px-5 py-4">
          <h2 className="text-sm font-medium text-white">
            {t("recentActivity.title")}
          </h2>
        </div>
        {data.activity.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[var(--nht-text-secondary)]">
            {t("recentActivity.empty")}
          </p>
        ) : (
          <ul className="divide-y divide-white/[0.04]">
            {data.activity.map((item) => (
              <li key={item.id} className="px-5 py-4">
                <p className="text-sm text-white">{item.title}</p>
                {item.body ? (
                  <p className="mt-1 text-xs text-[var(--nht-text-tertiary)]">
                    {item.body}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
