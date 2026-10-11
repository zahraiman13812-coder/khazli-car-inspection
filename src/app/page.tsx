import type {
  Metadata,
} from "next";

import ActiveAppointments from "@/components/booking/ActiveAppointments";

import AppointmentTracking from "@/components/home/AppointmentTracking";
import Booking from "@/components/home/Booking";
import Contact from "@/components/home/Contact";
import Education from "@/components/home/Education";
import FAQ from "@/components/home/FAQ";
import Feedback from "@/components/home/Feedback";
import Hero from "@/components/home/Hero";
import InspectionDetails from "@/components/home/InspectionDetails";
import Portfolio from "@/components/home/Portfolio";
import Process from "@/components/home/Process";
import Services from "@/components/home/Services";
import WhyUs from "@/components/home/WhyUs";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

import {
  getHomeArticles,
} from "@/lib/articles";

import {
  getPublicFaqs,
} from "@/lib/faqs";

import {
  getPublicPortfolio,
} from "@/lib/portfolio";

import {
  getSiteSettings,
} from "@/lib/site-settings";

import type {
  PublicSiteSettings,
} from "@/types/site-settings";

export const dynamic =
  "force-dynamic";

export const metadata: Metadata = {
  alternates: {
    canonical:
      "/",
  },

  openGraph: {
    type:
      "website",
    locale:
      "fa_IR",
    url:
      "/",
    title:
      "کارشناسی خودرو خزلی",
    description:
      "کارشناسی تخصصی رنگ، بدنه و وضعیت خودرو قبل از خرید با امکان دریافت نوبت آنلاین.",
    images: [
      {
        url:
          "/brand/logo.png",
        alt:
          "کارشناسی خودرو خزلی",
      },
    ],
  },

  twitter: {
    card:
      "summary",
    title:
      "کارشناسی خودرو خزلی",
    description:
      "کارشناسی تخصصی رنگ، بدنه و وضعیت خودرو قبل از خرید با امکان دریافت نوبت آنلاین.",
    images: [
      "/brand/logo.png",
    ],
  },
};


export default async function HomePage() {
  const [
    settings,
    faqs,
    portfolio,
    articles,
  ] =
    await Promise.all([
      getSiteSettings(),
      getPublicFaqs(),
      getPublicPortfolio(),
      getHomeArticles(),
    ]);

  const publicSettings:
    PublicSiteSettings = {
      businessName:
        settings.businessName,

      description:
        settings.description,

      phone:
        settings.phone,

      whatsappPhone:
        settings.whatsappPhone,

      address:
        settings.address,

      businessHours:
        settings.businessHours,

      instagramUrl:
        settings.instagramUrl,

      logoUrl:
        settings.logoUrl,

      mapUrl:
        settings.mapUrl,

      baladMapUrl:
        settings.baladMapUrl,

      neshanMapUrl:
        settings.neshanMapUrl,
    };

  return (
    <>
      <Header
        settings={
          publicSettings
        }
      />

      <main>
        <Hero />

        <Services />

        <InspectionDetails />

        <WhyUs />

        <Process />

        <Portfolio
          items={
            portfolio
          }
        />

        <Education
          items={
            articles
          }
        />

        <FAQ
          items={
            faqs
          }
        />

        <Booking />

        <ActiveAppointments />

        <AppointmentTracking />

        <Contact
          settings={
            publicSettings
          }
        />

        <Feedback />
      </main>

      <Footer
        settings={
          publicSettings
        }
      />
    </>
  );
}