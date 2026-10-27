import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Hero } from "@/components/home/hero";
import { ServicesSection } from "@/components/home/sections-services";
import { ToursSection } from "@/components/home/sections-tours";
import {
  ContactSection,
  FleetGallerySection,
  HowItWorksSection,
  ReviewsSection,
} from "@/components/home/sections-closing";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <ServicesSection />
        <ToursSection />
        <HowItWorksSection />
        <FleetGallerySection />
        <ReviewsSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
