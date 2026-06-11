export const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const divineApiUrl =
  process.env.NEXT_PUBLIC_DIVINE_API_URL || "https://api.divineskins.gg";

export const discordInviteUrl = "https://discord.gg/divineskins";

export const githubRepoUrl = "https://github.com/DivineSkins/divine-wiki";

export const contentLicenseUrl =
  "https://creativecommons.org/licenses/by-nc-sa/4.0/";

// $id of the sentinel separator node appended to the docs page tree. The
// sidebar's Separator renderer swaps it for the Contribute button so the
// trigger sits right under the nav tree (see src/components/sidebar-contribute.tsx).
export const contributeSidebarNodeId = "contribute-sidebar-button";
