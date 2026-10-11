import type {
  Metadata,
} from "next";

import {
  Vazirmatn,
} from "next/font/google";

import type {
  ReactNode,
} from "react";

import {
  getSiteUrl,
} from "@/lib/site-url";

import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: [
    "arabic",
    "latin",
  ],
  display:
    "swap",
  variable:
    "--font-vazirmatn",
});

const siteName =
  "کارشناسی خودرو خزلی";

const siteDescription =
  "کارشناسی تخصصی رنگ، بدنه و وضعیت خودرو قبل از خرید با امکان دریافت نوبت آنلاین.";

export const metadata: Metadata = {
  metadataBase:
    new URL(
      getSiteUrl(),
    ),

  applicationName:
    siteName,

  title: {
    default:
      siteName,
    template:
      `%s | ${siteName}`,
  },

  description:
    siteDescription,

  keywords: [
    "کارشناسی خودرو",
    "کارشناسی رنگ خودرو",
    "کارشناسی بدنه خودرو",
    "تشخیص رنگ خودرو",
    "کارشناسی خودرو قبل از خرید",
  ],

  icons: {
    icon:
      "/brand/logo.png",
    apple:
      "/brand/logo.png",
  },

  formatDetection: {
    telephone:
      false,
    address:
      false,
    email:
      false,
  },
};

export default function RootLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={
        vazirmatn.variable
      }
    >
      <body className="bg-page font-[family-name:var(--font-vazirmatn)] text-ink antialiased">
        {
          children
        }
      </body>
    </html>
  );
}
