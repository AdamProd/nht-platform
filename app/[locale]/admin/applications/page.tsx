import AdminPlaceholderPage from "@/components/admin/AdminPlaceholderPage";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminApplicationsPage({ params }: Props) {
  const { locale } = await params;
  return <AdminPlaceholderPage locale={locale} pageKey="applications" />;
}
