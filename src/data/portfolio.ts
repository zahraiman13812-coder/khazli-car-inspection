/*
 * ============================================================
 * PORTFOLIO DATA
 * اطلاعات نمونه کارشناسی‌ها
 * ============================================================
 */

export type PortfolioItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  services: string[];
  result?: string;
  featured?: boolean;
};

export const portfolioItems: PortfolioItem[] = [
  {
    id: "car-01",
    title: "BMW 530i",
    subtitle: "کارشناسی رنگ و بدنه",
    image: "/portfolio/car-01.jpg",
    services: [
      "بررسی رنگ بدنه",
      "بررسی قطعات تعویضی",
      "بررسی شاسی و ستون",
    ],
    result: "کارشناسی کامل",
    featured: true,
  },

  {
    id: "car-02",
    title: "Mercedes-Benz C200",
    subtitle: "کارشناسی پیش از خرید",
    image: "/portfolio/car-02.jpg",
    services: [
      "ضخامت‌سنجی رنگ",
      "بررسی بدنه",
      "بررسی آثار ضربه",
    ],
    result: "بررسی کامل",
  },

  {
    id: "car-03",
    title: "Hyundai Sonata",
    subtitle: "کارشناسی رنگ خودرو",
    image: "/portfolio/car-03.jpg",
    services: [
      "بررسی رنگ‌شدگی",
      "بررسی بتونه",
      "بررسی قطعات تعویضی",
    ],
    result: "کارشناسی رنگ",
  },

  {
    id: "car-04",
    title: "Kia Sportage",
    subtitle: "کارشناسی بدنه",
    image: "/portfolio/car-04.jpg",
    services: [
      "بررسی شاسی",
      "بررسی ستون‌ها",
      "بررسی آسیب بدنه",
    ],
    result: "بررسی بدنه",
  },

  {
    id: "car-05",
    title: "Toyota Camry",
    subtitle: "کارشناسی پیش از معامله",
    image: "/portfolio/car-05.jpg",
    services: [
      "بررسی رنگ",
      "بررسی بدنه",
      "گزارش کارشناسی",
    ],
    result: "کارشناسی کامل",
  },

  {
    id: "car-06",
    title: "Peugeot 207",
    subtitle: "کارشناسی رنگ و بدنه",
    image: "/portfolio/car-06.jpg",
    services: [
      "بررسی ضخامت رنگ",
      "تشخیص رنگ‌شدگی",
      "بررسی بدنه",
    ],
    result: "بررسی کامل",
  },
];