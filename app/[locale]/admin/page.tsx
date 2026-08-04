import { getTranslations, setRequestLocale } from "next-intl/server";
import { getDashboardData } from "@/features/dashboard/queries/get-dashboard-data";
import DashboardKpiCards from "@/features/dashboard/components/DashboardKpiCards";
import DashboardRecentApplications from "@/features/dashboard/components/DashboardRecentApplications";
import DashboardPlatformBreakdown from "@/features/dashboard/components/DashboardPlatformBreakdown";
import DashboardQuickActions from "@/features/dashboard/components/DashboardQuickActions";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.dashboard");

  let data;
  let loadError: string | null = null;

  try {
    data = await getDashboardData();
  } catch (error) {
    console.error(error);
    loadError = t("errors.load");
    data = {
      kpis: { total: 0, new: 0, reviewing: 0, active: 0, rejected: 0 },
      recent: [],
      platforms: [],
    };
  }

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

      {loadError ? (
        <div className="rounded-[var(--nht-radius-xl)] border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-sm text-[var(--nht-text-secondary)]">
          {loadError}
        </div>
      ) : null}

      <DashboardKpiCards
        kpis={data.kpis}
        labels={{
          total: t("kpis.total"),
          new: t("kpis.new"),
          reviewing: t("kpis.reviewing"),
          active: t("kpis.active"),
          rejected: t("kpis.rejected"),
        }}
      />

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <DashboardRecentApplications
            items={data.recent}
            locale={locale}
            labels={{
              title: t("recent.title"),
              empty: t("recent.empty"),
              name: t("recent.name"),
              platform: t("recent.platform"),
              status: t("recent.status"),
              priority: t("recent.priority"),
              created: t("recent.created"),
              viewAll: t("recent.viewAll"),
            }}
          />
        </div>
        <div className="xl:col-span-2">
          <DashboardPlatformBreakdown
            items={data.platforms}
            labels={{
              title: t("platforms.title"),
              empty: t("platforms.empty"),
            }}
          />
        </div>
      </div>

      <DashboardQuickActions
        labels={{
          title: t("quickActions.title"),
          applications: t("quickActions.applications"),
          creators: t("quickActions.creators"),
          blog: t("quickActions.blog"),
          analytics: t("quickActions.analytics"),
          settings: t("quickActions.settings"),
        }}
      />
    </div>
  );
}
