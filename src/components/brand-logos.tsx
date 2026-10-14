/**
 * Brand logos (Simple Icons, simpleicons.org) rendered monochrome via
 * `currentColor` so they sit in the same one-tone vocabulary as the Lucide
 * icons used elsewhere. No width/height on the <svg> so size comes from the
 * parent (a `size-*` className or the sidebar's `[&_svg]:size-*` rule).
 */

interface LogoProps {
  className?: string;
}

export function MayaLogo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M4.348 0 .69 2.203v16.875l3.657-2.203h17.297V1.219c0-.67-.551-1.219-1.22-1.219H4.349zm18.297 3.75v14.125H4.627l-1.943 1.17v3.736c0 .67.55 1.219 1.218 1.219H23.31V3.75h-.664zm-14.471.025h2.937l1.885 7.508 1.977-7.48-.012-.028h2.857v9.354h-2.216v-6.04l-1.565 6.026v.014h-2.203l-1.656-6.28v6.28H8.174V3.775zm1.33 14.762h1.18l1.068 3.543h-.902l-.217-.773H9.568l-.197.773h-.88l1.013-3.543zm1.918 0h.932l.648 1.494.643-1.494h.894l-1.113 2.133v1.41h-.887v-1.406l-1.117-2.137zm3.826 0h1.18l1.068 3.543h-.9l-.217-.773h-1.065l-.197.773h-.88l1.011-3.543zm-5.156.582-.362 1.53h.73l-.368-1.53zm5.744 0-.36 1.53h.73l-.37-1.53z" />
    </svg>
  );
}

export function BlenderLogo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12.51 13.214c.046-.8.438-1.506 1.03-2.006a3.424 3.424 0 0 1 2.212-.79c.85 0 1.631.3 2.211.79.592.5.983 1.206 1.028 2.005.045.823-.285 1.586-.865 2.153a3.389 3.389 0 0 1-2.374.938 3.393 3.393 0 0 1-2.376-.938c-.58-.567-.91-1.33-.865-2.152M7.35 14.831c.006.314.106.922.256 1.398a7.372 7.372 0 0 0 1.593 2.757 8.227 8.227 0 0 0 2.787 2.001 8.947 8.947 0 0 0 3.66.76 8.964 8.964 0 0 0 3.657-.772 8.285 8.285 0 0 0 2.785-2.01 7.428 7.428 0 0 0 1.592-2.762 6.964 6.964 0 0 0 .25-3.074 7.123 7.123 0 0 0-1.016-2.779 7.764 7.764 0 0 0-1.852-2.043h.002L13.566 2.55l-.02-.015c-.492-.378-1.319-.376-1.86.002-.547.382-.609 1.015-.123 1.415l-.001.001 3.126 2.543-9.53.01h-.013c-.788.001-1.545.518-1.695 1.172-.154.665.38 1.217 1.2 1.22V8.9l4.83-.01-8.62 6.617-.034.025c-.813.622-1.075 1.658-.563 2.313.52.667 1.625.668 2.447.004L7.414 14s-.069.52-.063.831zm12.09 1.741c-.97.988-2.326 1.548-3.795 1.55-1.47.004-2.827-.552-3.797-1.538a4.51 4.51 0 0 1-1.036-1.622 4.282 4.282 0 0 1 .282-3.519 4.702 4.702 0 0 1 1.153-1.371c.942-.768 2.141-1.183 3.396-1.185 1.256-.002 2.455.41 3.398 1.175.48.391.87.854 1.152 1.367a4.28 4.28 0 0 1 .522 1.706 4.236 4.236 0 0 1-.239 1.811 4.54 4.54 0 0 1-1.035 1.626" />
    </svg>
  );
}

export function DiscordLogo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  );
}

export function GitHubLogo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export function YouTubeLogo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

/**
 * The one logo that is NOT monochrome. League's mark is the game picker's
 * brand trigger, and the real artwork (gold "L", teal orb, dark outline) is
 * what makes it recognisable — a flat `currentColor` silhouette read as just
 * another grey sidebar glyph.
 *
 * A raster <img> rather than the Simple Icons path: the multi-tone artwork
 * can't be expressed as one fill. Plain <img>, not next/image, because callers
 * pass a `size-*` className and next/image's `fill` needs a positioned wrapper
 * — this keeps the same sizing contract as the <svg> logos above.
 */
export function LeagueOfLegendsLogo({ className }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/league-logo.webp"
      alt=""
      // `size-full` fills whatever box fumadocs gives the icon. The scale is
      // deliberate: with object-contain the 512x512 artwork fits by its TALLER
      // axis (content is 97.1% tall but only 89.1% wide), so the visible mark
      // lands smaller than the Lucide glyphs beside it.
      className={`brand-mark size-full scale-125 object-contain ${className ?? ""}`}
      aria-hidden
      draggable={false}
    />
  );
}

/**
 * Divine's own app marks — Flint, Jade, Quartz, Ruby — taken from the
 * official set at RitoShark/.github/public and re-encoded to WebP, trimmed
 * to the artwork's own bounds so all four share one optical size.
 *
 * These stay in colour for the same reason the League mark above does. They
 * are illustrated flame and faceted-gem artwork; flattened to a
 * `currentColor` silhouette the gems collapse into near-identical grey
 * blobs, which is worse than useless in a list whose whole job is telling
 * Jade from Quartz from Ruby. Third-party tools beside them (Maya, Blender,
 * GIMP, Wwise) stay monochrome, so colour also reads as "this one is ours".
 *
 * Plain <img>, not next/image, to match the sizing contract of the <svg>
 * logos: callers pass a `size-*` className and get that box.
 */
function AppMark({ src, className }: LogoProps & { src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      // No `size-full`: unlike the League mark these are called with an
      // explicit `size-*` from the icon resolver, and stacking both leaves
      // Tailwind to break the tie by stylesheet order rather than intent.
      className={`brand-mark object-contain ${className ?? "size-5"}`}
      aria-hidden
      draggable={false}
    />
  );
}

export function FlintLogo({ className }: LogoProps) {
  return <AppMark src="/brand/flint-logo.webp" className={className} />;
}

export function JadeLogo({ className }: LogoProps) {
  return <AppMark src="/brand/jade-logo.webp" className={className} />;
}

export function QuartzLogo({ className }: LogoProps) {
  return <AppMark src="/brand/quartz-logo.webp" className={className} />;
}

export function RubyLogo({ className }: LogoProps) {
  return <AppMark src="/brand/ruby-logo.webp" className={className} />;
}
/**
 * LtMAO ships no product logo. Its icon is whichever theme's character art
 * is active, and `raora` is the one the author screenshots in the README,
 * so that is the face the app wears by default. Square and uncropped: the
 * circle people associate with it is GitHub's own avatar mask, not the art.
 */
export function LtMAOLogo({ className }: LogoProps) {
  return <AppMark src="/brand/ltmao-logo.webp" className={className} />;
}

export function GimpLogo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M15.496 8.608a2.175 2.385 0 0 0-2.175 2.384 2.175 2.385 0 0 0 2.175 2.385 2.175 2.385 0 0 0 2.175-2.385 2.175 2.385 0 0 0-2.175-2.384zm0 .15a.934.934 0 0 1 .933.935.934.934 0 0 1-.933.934.934.934 0 0 1-.934-.934.934.934 0 0 1 .934-.934zm4.903 9.433a.314.314 0 0 0-.094.014c-.278.08-.642.735-.563 1.013.079.278.356.152.524.245.149.083.196.33.4.329-.033.446.125.903.398 1.231.464.564 1.173.576 1.627.68.453.103.789.38.955.683h-.01c.14.253.413-.965.313-1.81-.199-1.692-1.827-2.294-2.657-1.856-.095-.218-.349-.112-.507-.2-.147-.082-.195-.323-.39-.329zM2.01 8.207a2.938 2.279 78.561 0 0-.296.036 2.938 2.279 78.561 0 0-1.637 3.343 2.938 2.279 78.561 0 0 2.824 2.412 2.938 2.279 78.561 0 0 1.637-3.343A2.938 2.279 78.561 0 0 2.01 8.207zm.02.182a1.24 1.24 89.982 0 1 1.24 1.24 1.24 1.24 89.982 0 1-1.24 1.241 1.24 1.24 89.982 0 1-1.24-1.24 1.24 1.24 89.982 0 1 1.24-1.24zm7.296.619a1.61 1.957 0 0 0-1.61 1.957 1.61 1.957 0 0 0 1.61 1.957 1.61 1.957 0 0 0 1.61-1.957 1.61 1.957 0 0 0-1.61-1.957zm.01.142a.734.734 0 0 1 .733.733.734.734 0 0 1-.733.734.734.734 0 0 1-.734-.734.734.734 0 0 1 .734-.733zm13.785-7.57c-.082.01-.178.056-.278.184-2.255 3.385-5.54 4.902-7.936 5.521a3.513 3.586 0 0 1 3.25 3.576 3.513 3.586 0 0 1-3.513 3.586 3.513 3.586 0 0 1-3.375-2.595 2.676 2.998 0 0 1-2.52 2 2.676 2.998 0 0 1-2.676-2.998 2.676 2.998 0 0 1 2.675-2.999 2.676 2.998 0 0 1 2.517 2.037 3.513 3.586 0 0 1 1.878-2.27c-1.887.246-2.89-.025-4.335-.649-1.024-.56-1.722-1.173-2.48-2.359-.036-.055-.11-.086-.16-.025-.18.241-.97 5.723-.98 6.227-.033 1.632-.706 3.593-2.73 3.661 1.864 3.799 5.919 5.465 10.586 5.397 1.404.01 3.329-.332 5.171-1.243a213.84 213.84 0 0 1-1.568-.996c-1.347.788-2.935 1.09-4.674 1.019-2.217-.09-1.847-.732-1.36-.667 3.574.506 5.82-.624 7.315-2.547a34.596 34.596 0 0 1-.556-.377c-.164-.114.032-.291.385-.304h.04c.205-.002.458.056.722.206.757.433.783.965.535 1.081-.08.037-.263-.048-.439-.151-.255.329-.53.622-.818.887h.01c.668.29 1.568.684 2.005.89a9.634 9.634 0 0 0 3.017-3.574c2.18-4.449.652-12.176.614-12.29-.039-.112-.15-.211-.242-.226h-.076z" />
    </svg>
  );
}

export function WwiseLogo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M6 12c0 .7644-.6193 1.3846-1.3846 1.3846-.7645 0-1.3847-.6202-1.3847-1.3846 0-.765.6202-1.3846 1.3847-1.3846C5.3807 10.6154 6 11.2351 6 12m7.8462-5.5384c0 1.0191-.826 1.8461-1.8463 1.8461-1.0188 0-1.8461-.827-1.8461-1.8461 0-1.0197.8273-1.8462 1.8461-1.8462 1.0203 0 1.8463.8265 1.8463 1.8462M1.8462 12a.923.923 0 0 1-.9231.923C.4143 12.923 0 12.5096 0 12c0-.5102.4142-.923.923-.923.51 0 .923.4128.923.923M24 12c0 .5095-.4133.923-.923.923-.5089 0-.9231-.4135-.9231-.923 0-.5102.4142-.923.923-.923.5098 0 .923.4128.923.923m-3.2306 0c0 .7644-.6195 1.3846-1.3847 1.3846C18.6203 13.3846 18 12.7644 18 12c0-.765.6203-1.3846 1.3846-1.3846.7652 0 1.3847.6197 1.3847 1.3846m-8.2252 2.8356c.0034.535.2557 1.0139.6581 1.3139.4006.3332.6584.8409.6584 1.4048 0 1.0139-.8192 1.8303-1.8295 1.8303H12c-1.0116 0-1.8317-.8164-1.8317-1.8303 0-.564.2596-1.0716.6606-1.4048.3999-.3.6615-.7788.6577-1.314v-.1283c-.004-.5395-.2578-1.0183-.6577-1.3154-.401-.336-.6606-.8423-.6606-1.4077 0-1.0125.8201-1.8302 1.8317-1.8302h.0312c1.0103 0 1.8295.8177 1.8295 1.8302 0 .5654-.2578 1.0717-.6584 1.4077a1.6166 1.6166 0 0 0-.658 1.3154v.1284m3.6922-2.7692c.0033.535.2557 1.0139.658 1.3139.4007.3332.6585.8409.6585 1.4048 0 1.0139-.8192 1.8302-1.8295 1.8302h-.031c-1.0118 0-1.8318-.8163-1.8318-1.8302 0-.564.2597-1.0716.6606-1.4048.3999-.3.6614-.7788.6577-1.314v-.1283c-.004-.5395-.2578-1.0183-.6577-1.3154-.401-.336-.6606-.8423-.6606-1.4077 0-1.0125.82-1.8302 1.8318-1.8302h.031c1.0103 0 1.8295.8177 1.8295 1.8302 0 .5654-.2578 1.0717-.6584 1.4077a1.6166 1.6166 0 0 0-.658 1.3154v.1284m-7.3848 0c.0035.535.2559 1.0139.6582 1.3139a1.828 1.828 0 0 1 .6583 1.4048c0 1.0139-.8193 1.8302-1.8294 1.8302h-.0312c-1.0116 0-1.8317-.8163-1.8317-1.8302 0-.564.2596-1.0716.6606-1.4048.3999-.3.6615-.7788.6577-1.314v-.1283c-.004-.5395-.2578-1.0183-.6577-1.3154-.401-.336-.6606-.8423-.6606-1.4077 0-1.0125.8201-1.8302 1.8317-1.8302h.0312c1.0101 0 1.8294.8177 1.8294 1.8302 0 .5654-.2578 1.0717-.6583 1.4077a1.617 1.617 0 0 0-.6582 1.3154v.1284" />
    </svg>
  );
}
