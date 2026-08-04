import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/marketing/Hero";
import LogoMarquee from "@/components/marketing/LogoMarquee";
import Services from "@/components/marketing/Services";
import WhyChooseUs from "@/components/marketing/WhyChooseUs";
import SuccessStories from "@/components/marketing/SuccessStories";
import FAQ from "@/components/marketing/FAQ";
import ContactForm from "@/components/marketing/ContactForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <LogoMarquee />
      <Services />
      <WhyChooseUs />
      <SuccessStories />
      <FAQ />
      <ContactForm />
    </>
  );
}
