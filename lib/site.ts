const FALLBACK_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(value: string | undefined) {
  if (!value) {
    return FALLBACK_SITE_URL;
  }

  try {
    return new URL(value).origin;
  } catch {
    try {
      return new URL(`https://${value}`).origin;
    } catch {
      return FALLBACK_SITE_URL;
    }
  }
}

export const siteName = "MessMate";

export const siteTitle = "Student mess and hostel management software";

export const siteDescription =
  "MessMate helps student mess and hostel teams manage meals, bazar, rent, deposits, notices, chat, and monthly reports from one server-rendered workspace.";

export const siteKeywords = [
  "student mess management software",
  "hostel management software",
  "mess management system",
  "meal tracking",
  "rent tracking",
  "deposit tracking",
  "bazar management",
  "notice board software",
  "hostel chat",
];

export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? process.env.AUTH_URL);

export function absoluteUrl(pathname = "/") {
  return new URL(pathname, siteUrl).toString();
}
