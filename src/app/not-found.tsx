import Link from "next/link";
import "./global.css";

/**
 * Root-level not-found. Required by Next.js whenever the root layout is a
 * pass-through (it returns children unchanged) — without this, the 404 path
 * has no <html>/<body> wrapper and the framework throws "Missing <html> and
 * <body> tags in the root layout."
 *
 * This page is the branded shell for unmatched URLs. We keep it dependency-
 * free (no fonts, no i18n provider, no client components) so it can render
 * even when downstream layouts haven't loaded.
 */
export default function RootNotFound() {
  return (
    <html lang="en" className="dark">
      <body
        style={{
          background: "#0b0a0f",
          color: "#e4e4e7",
          minHeight: "100vh",
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "96px 24px",
            textAlign: "center",
            background:
              "radial-gradient(ellipse at top, rgba(120,60,181,0.20), transparent 60%)",
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#8b8d98",
              margin: 0,
            }}
          >
            404
          </p>
          <h1
            style={{
              marginTop: 12,
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#e4e4e7",
              lineHeight: 1.05,
            }}
          >
            <span
              style={{
                background: "linear-gradient(90deg, #c084fc 0%, #783cb5 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Page
            </span>{" "}
            not found
          </h1>
          <p
            style={{
              marginTop: 20,
              maxWidth: 540,
              fontSize: 17,
              color: "#8b8d98",
              lineHeight: 1.45,
            }}
          >
            Wrong link, deleted guide, or it never existed. Head back to the
            wiki.
          </p>

          <div
            style={{
              marginTop: 32,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Link
              href="/en/docs"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 28px",
                background: "linear-gradient(90deg, #B472FF 0%, #783CB5 100%)",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                borderRadius: 12,
                textDecoration: "none",
                boxShadow: "0 0 54px -7px #783cb5",
              }}
            >
              Back to the wiki
            </Link>
            <Link
              href="/en"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 28px",
                border: "1px solid #363242",
                color: "#e4e4e7",
                fontSize: 14,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                borderRadius: 12,
                textDecoration: "none",
              }}
            >
              Home
            </Link>
          </div>

          <hr
            style={{
              marginTop: 48,
              width: 160,
              height: 1,
              border: 0,
              background: "#783cb5",
              opacity: 0.6,
            }}
          />
        </main>
      </body>
    </html>
  );
}
