export type UserLike = { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown>; email?: string } | null;
export const hasSuperAdminRole = (user: UserLike): boolean => user?.app_metadata?.role === "super_admin";
export const authorizeAdmin = (user: UserLike, hasMembership: boolean, aal: string | null): boolean => hasSuperAdminRole(user) && hasMembership && aal === "aal2";
export const authorizeAdminAccess = (user: UserLike, hasMembership: boolean, aal: string | null, allowAal1 = false): boolean =>
  hasSuperAdminRole(user) && hasMembership && (aal === "aal2" || (allowAal1 && aal === "aal1"));
export function hardenCookieOptions<T extends Record<string, unknown>>(options: T, production = process.env.NODE_ENV === "production") { return { ...options, httpOnly: true, sameSite: "lax" as const, secure: production, path: "/admin" }; }
export function supabaseConfig(env: Record<string, string | undefined> = process.env) { const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim(); const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(); return url && anonKey ? { configured: true as const, url, anonKey } : { configured: false as const, url: null, anonKey: null }; }
export function ingestionConfig(env: Record<string, string | undefined> = process.env) { const base=supabaseConfig(env); const serviceRoleKey=env.SUPABASE_SERVICE_ROLE_KEY?.trim(); return base.configured&&serviceRoleKey?{configured:true as const,url:base.url,serviceRoleKey}:{configured:false as const,url:null,serviceRoleKey:null}; }
