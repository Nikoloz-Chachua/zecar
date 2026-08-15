export function checkAnalyticsRequest(headers: Headers): "content-type" | "origin" | "fetch-metadata" | null {
  const contentType = headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) return "content-type";
  const origin = headers.get("origin");
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (!origin || !host) return "origin";
  try {
    const parsedOrigin = new URL(origin);
    const parsedHost = new URL(`http://${host}`);
    if (parsedOrigin.origin === "null" || parsedOrigin.host !== parsedHost.host || parsedHost.pathname !== "/") return "origin";
  } catch {
    return "origin";
  }
  const site = headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return "fetch-metadata";
  return null;
}

export function createRateLimiter(options: { limit: number; windowMs: number; maxEntries: number; now?: () => number }) {
  const entries = new Map<string, { count: number; start: number }>();
  const now = options.now ?? Date.now;
  return {
    allow(key: string) {
      const time = now();
      const current = entries.get(key);
      if (!current || time - current.start >= options.windowMs) entries.set(key, { count: 1, start: time });
      else if (current.count >= options.limit) return false;
      else current.count++;
      while (entries.size > options.maxEntries) entries.delete(entries.keys().next().value!);
      return true;
    },
    size: () => entries.size,
  };
}
