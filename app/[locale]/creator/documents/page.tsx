import { getTranslations, setRequestLocale } from "next-intl/server";
import { listDocuments } from "@/features/cabinet/queries/cabinet";
import { DocumentsPanel } from "@/features/cabinet/dashboard/CabinetForms";

type Props = { params: Promise<{ locale: string }> };

export default async function CreatorDocumentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("creator.documents");
  const tRoot = await getTranslations("creator");
  const { documents } = await listDocuments();

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
      <DocumentsPanel
        documents={documents}
        labels={{
          types: {
            passport: t("types.passport"),
            agreement: t("types.agreement"),
            tax: t("types.tax"),
            bank: t("types.bank"),
          },
          actions: {
            upload: t("actions.upload"),
            uploading: t("actions.uploading"),
            uploaded: t("actions.uploaded"),
            uploadError: t("actions.uploadError"),
            delete: t("actions.delete"),
          },
          empty: t("empty"),
          dropHint: t("dropHint"),
          toastUploaded: tRoot("toast.uploaded"),
        }}
      />
    </div>
  );
}
