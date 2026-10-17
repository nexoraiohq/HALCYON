/* eslint-disable @next/next/no-img-element -- all derivatives are pre-generated at build time; next/image's runtime optimizer added ~3.3s to first paint */
import type { CSSProperties } from "react";

type ImgProps = {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  quality?: number;
  style?: CSSProperties;
};

const WIDTHS = [480, 960, 1440, 2000];

function base(src: string) {
  return src.replace(/\.[a-z0-9]+$/i, "");
}

function srcSet(stem: string, ext: string) {
  return WIDTHS.map((w) => `${stem}-${w}.${ext} ${w}w`).join(", ");
}

export default function Img({
  src,
  alt,
  sizes = "100vw",
  priority = false,
  fetchPriority,
  className = "",
  fill = false,
  width,
  height,
  style,
}: ImgProps) {
  const isFill = fill || (!width && !height);

  // Backend-managed images (uploads, external URLs) have no pre-generated
  // derivative set — render them as a single plain image.
  if (!src.startsWith("/media/")) {
    return (
      <img
        src={src}
        alt={alt}
        width={!isFill ? width : undefined}
        height={!isFill ? height : undefined}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={fetchPriority ?? (priority ? "high" : "auto")}
        className={className}
        style={
          isFill
            ? { position: "absolute", inset: 0, height: "100%", width: "100%", ...style }
            : style
        }
      />
    );
  }

  const stem = base(src);

  const img = (
    <img
      src={`${stem}-1440.jpg`}
      srcSet={srcSet(stem, "jpg")}
      sizes={sizes}
      alt={alt}
      width={!isFill ? width : undefined}
      height={!isFill ? height : undefined}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={fetchPriority ?? (priority ? "high" : "auto")}
      className={className}
      style={
        isFill
          ? { position: "absolute", inset: 0, height: "100%", width: "100%", ...style }
          : style
      }
    />
  );

  return (
    <picture>
      <source type="image/webp" srcSet={srcSet(stem, "webp")} sizes={sizes} />
      {img}
    </picture>
  );
}
