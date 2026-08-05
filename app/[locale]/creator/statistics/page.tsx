import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getStats } from "@/features/cabinet/queries/cabinet";
import CabinetChart from "@/features/cabinet/components/CabinetChart";
import { STAT_RANGES, type StatRange } from "@/features/cabinet/types";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function CreatorStatisticsPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("creator.statistics");
  const sp = await searchParams;
  const raw = first(sp.range);
  const range = (STAT_RANGES.includes(raw as StatRange) ? raw : "30d") as StatRange;
  const { points } = await getStats(range);

  const rangeLabels = {
    "7d": t("ranges.d7"),
    "30d": t("ranges.d30"),
    "90d": t("ranges.d90"),
    "12m": t("ranges.m12"),
  };

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

      <div className="flex flex-wrap gap-2" role="group" aria-label={t("title")}>
        {STAT_RANGES.map((value) => (
          <Link
            key={value}
            href={`/creator/statistics?range=${value}`}
            className={`rounded-full px-4 py-2 text-xs ${
              range === value
                ? "bg-[var(--nht-gold-muted)] text-[var(--nht-gold)]"
                : "border border-white/10 text-white hover:bg-white/[0.05]"
            }`}
          >
            {rangeLabels[value]}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <CabinetChart
          title={t("charts.revenue")}
          dataKey="revenue"
          points={points}
          empty={t("empty")}
        />
        <CabinetChart
          title={t("charts.growth")}
          dataKey="growth"
          points={points}
          empty={t("empty")}
        />
        <CabinetChart
          title={t("charts.subscribers")}
          dataKey="subscribers"
          points={points}
          empty={t("empty")}
        />
        <CabinetChart
          title={t("charts.messages")}
          dataKey="messages"
          points={points}
          empty={t("empty")}
        />
        <CabinetChart
          title={t("charts.content")}
          dataKey="content"
          points={points}
          empty={t("empty")}
        />
      </div>
    </div>
  );
}
