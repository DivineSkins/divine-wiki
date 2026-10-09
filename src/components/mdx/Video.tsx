"use client";

import { useEffect, useRef } from "react";

interface VideoProps {
  src: string;
  poster: string;
  width: number;
  height: number;
  alt?: string;
  original?: string;
}

/** Silent guide demonstrations. Download/play only while near the viewport;
 * reduced-motion readers get a poster and native playback controls. */
export function Video({
  src,
  poster,
  width,
  height,
  alt,
  original,
}: VideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let pausedByReader = false;
    const update = () => {
      if (visible && !motion.matches && !pausedByReader) {
        void video.play().catch(() => {}); // Autoplay can be blocked by the browser.
      } else video.pause();
    };
    const onPause = () => {
      if (visible && !motion.matches) pausedByReader = true;
    };
    const onPlay = () => {
      pausedByReader = false;
    };
    video.addEventListener("pause", onPause);
    video.addEventListener("play", onPlay);
    motion.addEventListener("change", update);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        update();
      },
      { rootMargin: "150px" },
    );
    observer.observe(video);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", update);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("play", onPlay);
      video.pause();
    };
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      width={width}
      height={height}
      aria-label={alt || "Guide demonstration"}
      controls
      loop
      muted
      playsInline
      preload="none"
      className="h-auto max-w-full rounded-lg border"
    >
      <a href={original ?? src}>{alt || "View guide demonstration"}</a>
    </video>
  );
}
