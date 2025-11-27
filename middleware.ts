import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const intlMiddleware = createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  localeDetection: false,
});

const ARABIC_COUNTRIES = [
  "DZ","BH","KM","DJ","EG","IQ","JO","KW","LB","LY",
  "MR","MA","OM","PS","QA","SA","SO","SD","SY","TN",
  "AE","YE",
];

export async function middleware(req: NextRequest) {
  const { pathname,searchParams} = req.nextUrl;
  const method = req.method;
  const url = req.nextUrl;

  const token = await getToken({ req });
  const pathWithoutLang = url.pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");
//save news for now
  if(pathWithoutLang==="/news"){
     return NextResponse.redirect(new URL("/", req.url));
  }
  //save donate for now
  // if(pathWithoutLang==="/donate"){
  //    return NextResponse.redirect(new URL("/", req.url));
  // }

  // --- CASE A: Signin/Register rules ---
  if (pathWithoutLang === "/login" || pathWithoutLang === "/register") {
    if (token) {
      // already signed in → no need to access login/register
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // guest → must provide secret
    const secret = searchParams.get("secret");
    if (secret !== process.env.LOGIN_SECRET) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // --- CASE B: Dashboard access ---
  if (pathWithoutLang.startsWith("/dashboard")) {
    if (!token) {
      // guest → not allowed
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // any signed-in user can access, no role restriction
  }

  // --- CASE B2: Admin access protection ---
  if (pathWithoutLang.startsWith("/admin")) {
    if (!token) {
      // guest → redirect to admin sign-in
      return NextResponse.redirect(new URL("/auth/admin-signin", req.url));
    }
    
    // Note: Additional role verification happens at the API level
    // This middleware just ensures authentication
  }

  // --- CASE C: Geo-based locale redirect ---
  if (!/^\/(ar|en)(\/|$)/.test(pathname)) {
    const country =
  req.headers.get("cf-ipcountry") ||
  req.headers.get("x-vercel-ip-country") ||
  "EN";

    const isArabic = ARABIC_COUNTRIES.includes(country);
    const locale = isArabic ? "ar" : "en";

    const newUrl = new URL(`/${locale}${pathname}`, req.url);
    return NextResponse.redirect(newUrl);
  }

  // --- CASE D: intl ---
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|trpc|_next|_vercel|.*\\..*).*)",
  ],
};
