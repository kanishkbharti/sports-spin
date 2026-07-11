import { renderOgImage } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Squadr, home of Sports Squad Forge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage();
}
