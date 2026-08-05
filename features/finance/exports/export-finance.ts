"use server";

import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import { getMonthlyReport } from "@/features/finance/reports/queries/get-monthly-report";
import { FINANCE_PLATFORMS } from "@/features/finance/types";
import type {
  FinanceExportFormat,
  FinanceExportKind,
  FinanceExportResult,
} from "@/features/finance/types";

function isAdminLike(role: string): boolean {
  return role === "owner" || role === "admin" || role === "finance";
}

const exportFinanceSchema = z.object({
  kind: z.enum(["transactions", "payouts", "report"]),
  format: z.enum(["csv", "excel", "pdf"]),
  filters: z
    .object({
      status: z.string().optional(),
      creator: z.string().uuid().optional().or(z.literal("")),
      platform: z
        .union([z.enum(FINANCE_PLATFORMS), z.literal("")])
        .optional(),
      from: z.string().optional(),
      to: z.string().optional(),
      month: z.coerce.number().int().min(1).max(12).optional(),
      year: z.coerce.number().int().min(2000).max(2100).optional(),
      creatorId: z.string().uuid().optional().or(z.literal("")),
    })
    .optional()
    .default({}),
});

function escapeCsv(value: unknown): string {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function toCsv(headers: string[], rows: Array<Array<unknown>>): string {
  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ];
  return lines.join("\n");
}

function escapeXml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function toSpreadsheetMl(
  sheetName: string,
  headers: string[],
  rows: Array<Array<unknown>>,
): string {
  const headerCells = headers
    .map((h) => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`)
    .join("");
  const body = rows
    .map((row) => {
      const cells = row
        .map((cell) => {
          const isNumber =
            typeof cell === "number" && Number.isFinite(cell);
          return `<Cell><Data ss:Type="${isNumber ? "Number" : "String"}">${escapeXml(cell)}</Data></Cell>`;
        })
        .join("");
      return `<Row>${cells}</Row>`;
    })
    .join("");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="${escapeXml(sheetName)}">
  <Table>
   <Row>${headerCells}</Row>
   ${body}
  </Table>
 </Worksheet>
</Workbook>`;
}

function toPdfHtml(
  title: string,
  headers: string[],
  rows: Array<Array<unknown>>,
): string {
  const head = headers.map((h) => `<th>${escapeXml(h)}</th>`).join("");
  const body = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeXml(cell)}</td>`).join("")}</tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeXml(title)}</title>
<style>
  body { font-family: Georgia, "Times New Roman", serif; color: #111; padding: 24px; }
  h1 { font-size: 20px; margin: 0 0 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
  th { background: #f3f3f3; }
</style>
</head>
<body>
  <h1>${escapeXml(title)}</h1>
  <table>
    <thead><tr>${head}</tr></thead>
    <tbody>${body}</tbody>
  </table>
</body>
</html>`;
}

function encodeExport(
  format: FinanceExportFormat,
  kind: FinanceExportKind,
  headers: string[],
  rows: Array<Array<unknown>>,
): { filename: string; mime: string; content: string } {
  const stamp = new Date().toISOString().slice(0, 10);
  if (format === "csv") {
    return {
      filename: `finance-${kind}-${stamp}.csv`,
      mime: "text/csv;charset=utf-8",
      content: toCsv(headers, rows),
    };
  }
  if (format === "excel") {
    return {
      filename: `finance-${kind}-${stamp}.xls`,
      mime: "application/vnd.ms-excel",
      content: toSpreadsheetMl(`finance-${kind}`, headers, rows),
    };
  }
  return {
    filename: `finance-${kind}-${stamp}.html`,
    mime: "text/html;charset=utf-8",
    content: toPdfHtml(`Finance ${kind}`, headers, rows),
  };
}

export async function exportFinanceData(
  raw: unknown,
): Promise<FinanceExportResult> {
  const t = await getTranslations("admin.finance.actionErrors");

  try {
    const session = await requireStaffSession();
    if (!session || !hasPermission(session.profile.role, "finance.export")) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = exportFinanceSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    const { kind, format, filters } = parsed.data;
    const supabase = await createClient();

    let scopedIds: string[] | null = null;
    if (!isAdminLike(session.profile.role)) {
      const { data: creators } = await supabase
        .from("creators")
        .select("id")
        .eq("manager_id", session.profile.id);
      scopedIds = (creators ?? []).map((row) => row.id);
      if (scopedIds.length === 0) {
        const empty = encodeExport(format, kind, ["empty"], []);
        return { success: true, ...empty };
      }
    }

    if (kind === "report") {
      const now = new Date();
      const report = await getMonthlyReport({
        month: filters.month ?? now.getMonth() + 1,
        year: filters.year ?? now.getFullYear(),
        creatorId: filters.creatorId || filters.creator || null,
        platform: filters.platform || null,
      });
      const headers = [
        "month",
        "year",
        "creatorId",
        "platform",
        "revenue",
        "commission",
        "expenses",
        "netProfit",
      ];
      const rows = [
        [
          report.month,
          report.year,
          report.creatorId ?? "",
          report.platform ?? "",
          report.revenue,
          report.commission,
          report.expenses,
          report.netProfit,
        ],
      ];
      return { success: true, ...encodeExport(format, kind, headers, rows) };
    }

    if (kind === "payouts") {
      let query = supabase
        .from("creator_payouts")
        .select(
          "id, creator_id, amount, currency, status, method, period_start, period_end, requested_at, approved_at, paid_at, rejection_reason, notes, receipt_number",
        )
        .order("requested_at", { ascending: false })
        .limit(5000);

      if (scopedIds) query = query.in("creator_id", scopedIds);
      if (filters.status) {
        query = query.eq(
          "status",
          filters.status as "pending" | "processing" | "completed" | "failed",
        );
      }
      if (filters.creator) query = query.eq("creator_id", filters.creator);
      if (filters.from) query = query.gte("requested_at", filters.from);
      if (filters.to) query = query.lte("requested_at", `${filters.to}T23:59:59.999Z`);

      const { data, error } = await query;
      if (error) {
        console.error("[exportFinanceData.payouts]", error.message);
        return { success: false, error: t("save") };
      }

      const headers = [
        "id",
        "creator_id",
        "amount",
        "currency",
        "status",
        "method",
        "period_start",
        "period_end",
        "requested_at",
        "approved_at",
        "paid_at",
        "rejection_reason",
        "notes",
        "receipt_number",
      ];
      const rows = (data ?? []).map((row) => [
        row.id,
        row.creator_id,
        row.amount,
        row.currency,
        row.status,
        row.method,
        row.period_start,
        row.period_end,
        row.requested_at,
        row.approved_at,
        row.paid_at,
        row.rejection_reason,
        row.notes,
        row.receipt_number,
      ]);
      return { success: true, ...encodeExport(format, kind, headers, rows) };
    }

    let query = supabase
      .from("finance_transactions")
      .select(
        "id, creator_id, manager_id, platform, transaction_date, gross_revenue, agency_amount, creator_amount, currency, status, payment_method, reference_id, notes",
      )
      .order("transaction_date", { ascending: false })
      .limit(5000);

    if (scopedIds) query = query.in("creator_id", scopedIds);
    if (filters.status) {
      query = query.eq(
        "status",
        filters.status as
          | "pending"
          | "approved"
          | "paid"
          | "cancelled"
          | "disputed",
      );
    }
    if (filters.creator) query = query.eq("creator_id", filters.creator);
    if (filters.platform) query = query.eq("platform", filters.platform);
    if (filters.from) query = query.gte("transaction_date", filters.from);
    if (filters.to) query = query.lte("transaction_date", filters.to);

    const { data, error } = await query;
    if (error) {
      console.error("[exportFinanceData.transactions]", error.message);
      return { success: false, error: t("save") };
    }

    const headers = [
      "id",
      "creator_id",
      "manager_id",
      "platform",
      "transaction_date",
      "gross_revenue",
      "agency_amount",
      "creator_amount",
      "currency",
      "status",
      "payment_method",
      "reference_id",
      "notes",
    ];
    const rows = (data ?? []).map((row) => [
      row.id,
      row.creator_id,
      row.manager_id,
      row.platform,
      row.transaction_date,
      row.gross_revenue,
      row.agency_amount,
      row.creator_amount,
      row.currency,
      row.status,
      row.payment_method,
      row.reference_id,
      row.notes,
    ]);

    return { success: true, ...encodeExport(format, kind, headers, rows) };
  } catch (error) {
    console.error("[exportFinanceData] unexpected:", error);
    return { success: false, error: t("save") };
  }
}
