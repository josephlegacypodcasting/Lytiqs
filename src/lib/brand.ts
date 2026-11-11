export const LYT_CTA_URL =
  process.env.NEXT_PUBLIC_LYT_CTA_URL ||
  "https://meetings.hubspot.com/elizabeth-bullis";

export const LYT_SITE_URL = "https://www.lytiqs.com";

export const BRAND = {
  company: "LYTIQS",
  product: "LYTE",
  slogan: "Ready your workforce, shape your future",
  lyteLine:
    "Your HCM manages the data. LYTIQS LYTE helps you understand what it means.",
  tagline: "See more than your HCM can show you",
  lyteCalculator: "Workforce Data Calculator",
  lyteCtaHeading: "Your HCM has the data. LYTE helps you see more in it.",
  lyteCtaBody:
    "LYTIQS LYTE turns the workforce data you already have into clear, actionable people analytics across turnover and retention, talent acquisition, and internal mobility, without relying on manual reporting or adding another complicated analytics project.",
  lyteCta: "See What LYTE Could Show You",
} as const;
