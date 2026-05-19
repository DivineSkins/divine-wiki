/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { source } from "@/lib/source";
import { NextRequest } from "next/server";
import { notFound } from "next/navigation";
import { ogLanguageBlacklist } from "@/lib/i18n";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string; slug?: string[] }> },
) {
  const { lang, slug = [] } = await params;

  if (ogLanguageBlacklist.includes(lang)) {
    return notFound();
  }

  const page = source.getPage(slug, lang);
  if (!page) return notFound();

  const logoSrc = await loadLogoDataUri();
  const origin = new URL(request.url).origin;

  return new ImageResponse(
    <div
      style={{
        background:
          "linear-gradient(135deg, #0b0a0f 0%, #15141c 50%, #111016 100%)",
        color: "#e4e4e7",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "96px",
        fontFamily: "Manrope, sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: "#783cb5",
          display: "flex",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "28px",
        }}
      >
        <span
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {page.data.title}
        </span>
        <div
          style={{
            height: 2,
            width: 280,
            background: "#783cb5",
            display: "flex",
          }}
        />
        {page.data.description && (
          <span
            style={{
              fontSize: 32,
              fontWeight: 400,
              color: "#8b8d98",
              lineHeight: 1.35,
              marginTop: 8,
            }}
          >
            {page.data.description}
          </span>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
          fontSize: 36,
          fontWeight: 700,
        }}
      >
        {logoSrc ? (
          <img
            src={logoSrc}
            width={64}
            height={64}
            alt="Divine Skins"
            style={{ borderRadius: 12 }}
          />
        ) : (
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "linear-gradient(135deg, #c084fc 0%, #783cb5 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                background: "#ecb96a",
              }}
            />
          </div>
        )}
        <span style={{ color: "#ffffff", letterSpacing: "-0.01em" }}>
          Divine Skins Wiki
        </span>
      </div>

      {/* Reference origin so unused-var lints stay happy in case we want it later */}
      <span style={{ display: "none" }}>{origin}</span>
    </div>,
  );
}

let cachedLogo: string | null | undefined;

async function loadLogoDataUri(): Promise<string | null> {
  if (cachedLogo !== undefined) return cachedLogo;
  try {
    const buf = await readFile(
      join(process.cwd(), "public", "brand", "logo.webp"),
    );
    cachedLogo = `data:image/webp;base64,${buf.toString("base64")}`;
  } catch {
    cachedLogo = null;
  }
  return cachedLogo;
}

export function generateStaticParams() {
  return source.generateParams();
}
