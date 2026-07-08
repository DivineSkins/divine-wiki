"use client";

import { useLayoutEffect } from "react";
import { applyStoredAppearance } from "@/lib/appearance";

/**
 * Re-applies the persisted appearance preferences after a client-side
 * language switch. <html> is rendered by the [lang] layout, so changing
 * locale remounts that segment and React resets the html attributes to the
 * server-rendered ones — wiping the classes the pre-paint script and
 * next-themes added (reading width, Minimal style, font, theme). This
 * component remounts along with the segment; its layout effect runs after
 * React's DOM reset but before paint, so the preferences come back without
 * a visible flash.
 */
export function ApplyAppearance() {
  useLayoutEffect(() => {
    applyStoredAppearance();
  }, []);

  return null;
}
