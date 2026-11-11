import Image from "next/image";
import { BRAND, LYT_SITE_URL } from "@/lib/brand";

export function Chrome({
  isEmbedded,
  children,
}: {
  isEmbedded?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {!isEmbedded && (
        <header className="border-b border-[var(--rule)] bg-[var(--paper)]">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8 sm:py-4">
            <a href={LYT_SITE_URL} className="-my-2 shrink-0 py-2" aria-label={BRAND.company}>
              <Image
                src="/lytiqs-logo.png"
                alt={BRAND.company}
                width={692}
                height={162}
                priority
                className="h-7 w-auto sm:h-8"
              />
            </a>
            <span className="hidden text-[0.8125rem] font-medium text-[var(--ink-faint)] sm:block">
              {BRAND.tagline}
            </span>
          </div>
        </header>
      )}
      <main className="flex-1 px-5 py-9 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
      {!isEmbedded && (
        <footer className="mt-10 border-t border-[var(--rule)] px-5 py-6 sm:px-8">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-[0.8125rem] text-[var(--ink-faint)]">
            <span>
              © {new Date().getFullYear()} {BRAND.company}, Inc.{" "}
              <span className="hidden sm:inline">{BRAND.slogan}.</span>
            </span>
            <a
              href={LYT_SITE_URL}
              className="-my-3 py-3 font-medium text-[var(--ink-soft)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
            >
              lytiqs.com
            </a>
          </div>
        </footer>
      )}
    </div>
  );
}
