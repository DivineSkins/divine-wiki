interface YouTubeProps {
  id: string;
  start?: number | string;
  list?: string;
  title?: string;
}

export function YouTube({ id, start, list, title }: YouTubeProps) {
  const startSeconds = typeof start === "string" ? parseInt(start, 10) : start;
  const params = new URLSearchParams();
  if (startSeconds && startSeconds > 0)
    params.set("start", String(startSeconds));
  if (list) params.set("list", list);
  const qs = params.toString();
  const src = `https://www.youtube-nocookie.com/embed/${id}${qs ? `?${qs}` : ""}`;

  return (
    <div className="border-divine-border my-4 aspect-video overflow-hidden rounded-lg border bg-black">
      <iframe
        src={src}
        title={title ?? "YouTube video"}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="h-full w-full"
      />
    </div>
  );
}
