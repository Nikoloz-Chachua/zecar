"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { resolveLocalizedTitle } from "@/lib/page-title";
import { useLocale } from "./locale-provider";

export function LocalizedSkipLink() {
  const { dictionary } = useLocale();
  return <a href="#main" className="skip-link">{dictionary.common.skip}</a>;
}

export function LocaleTitleSync() {
  const pathname = usePathname();
  const { locale } = useLocale();
  useEffect(() => {
    const title = resolveLocalizedTitle(pathname, locale);
    const syncTitle = () => { if (document.title !== title) document.title = title; };
    syncTitle();
    const observer = new MutationObserver(syncTitle);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [locale, pathname]);
  return null;
}
