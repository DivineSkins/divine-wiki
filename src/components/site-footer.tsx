import { getMessages } from "@/lib/locale";
import { contentLicenseUrl, githubRepoUrl } from "@/lib/config";

/**
 * Legal footer shown on the home and docs layouts: Riot Games disclaimer
 * plus the content (CC BY-NC-SA 4.0) and code (MIT) license notices. The
 * license terms themselves live in /LICENSE and /content/LICENSE.
 */
export function SiteFooter({ locale }: { locale: string }) {
  const messages = getMessages(locale);

  const linkClass =
    "underline underline-offset-2 transition-colors hover:text-divine-text";

  return (
    <footer className="border-divine-border/60 mt-auto border-t">
      <div className="text-divine-text-muted mx-auto max-w-3xl px-4 py-8 text-center text-xs leading-relaxed">
        <p>{messages.footer.disclaimer}</p>
        <p className="mt-2">
          {messages.footer.contentLicense}{" "}
          <a
            href={contentLicenseUrl}
            target="_blank"
            rel="license noopener noreferrer"
            className={linkClass}
          >
            CC BY-NC-SA 4.0
          </a>
          {" · "}
          {messages.footer.codeLicense}{" "}
          <a
            href={`${githubRepoUrl}/blob/main/LICENSE`}
            target="_blank"
            rel="license noopener noreferrer"
            className={linkClass}
          >
            MIT
          </a>
        </p>
      </div>
    </footer>
  );
}
