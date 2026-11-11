import type { Metadata } from "next";
import { LyteExperience } from "@/components/lyte/lyte-experience";

const description =
  "Four short steps on your workforce, turnover, hiring and internal movement. See what your existing workforce data may already be telling you about turnover cost, early-tenure departures and the recruiting investment behind them.";

export const metadata: Metadata = {
  title: "Workforce Data Calculator | LYTIQS",
  description,
  robots: { index: true, follow: true },
  openGraph: {
    title: "Workforce Data Calculator | LYTIQS",
    description,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Workforce Data Calculator | LYTIQS",
    description,
  },
};

export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { embed } = await searchParams;
  const isEmbedded = embed === "1" || embed === "true";
  return <LyteExperience isEmbedded={isEmbedded} />;
}
