import AdminPlaceholderPage from "@/components/admin/AdminPlaceholderPage";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminCreatorsPage({ params }: Props) {
  const { locale } = await params;
  return <AdminPlaceholderPage locale={locale} pageKey="creators" />;
}
