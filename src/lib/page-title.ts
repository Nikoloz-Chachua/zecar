import { vehicles } from "@/data/vehicles";
import { dictionaries, type Locale } from "@/lib/i18n";

type StaticPage = Exclude<keyof (typeof dictionaries)[Locale]["pageTitles"], "notFound">;

const staticPages: Record<string, StaticPage> = {
  "/": "home",
  "/cars": "cars",
  "/about": "about",
  "/contact": "contact",
};

export function resolveLocalizedTitle(pathname: string, locale: Locale): string {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const page = staticPages[normalizedPath];
  if (page) {
    const title = dictionaries[locale].pageTitles[page];
    return page === "home" ? title : `${title} | ZECAR`;
  }

  const vehicle = vehicles.find(({ slug }) => normalizedPath === `/cars/${slug}`);
  if (vehicle) return `${vehicle.year} ${vehicle.make} ${vehicle.model} | ZECAR`;

  return `${dictionaries[locale].pageTitles.notFound} | ZECAR`;
}
