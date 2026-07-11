import { toBlob } from "html-to-image";

export type ImageShareOutcome = "shared" | "downloaded" | "cancelled" | "failed";

const SHARE_URL = "https://trysquadr.com";

/**
 * Rewrites cross-origin image sources to a same-origin proxy so the node can
 * be rasterised without tainting the canvas, then restores them afterwards.
 */
async function withProxiedImages<T>(
  node: HTMLElement,
  run: () => Promise<T>
): Promise<T> {
  const imgs = Array.from(node.querySelectorAll("img"));
  const originals = imgs.map((img) => img.getAttribute("src") ?? "");

  imgs.forEach((img, i) => {
    const src = originals[i];
    if (/^https?:\/\//i.test(src) && !src.startsWith(window.location.origin)) {
      img.setAttribute("src", `/api/img?u=${encodeURIComponent(src)}`);
    }
  });

  // Wait for the swapped images to (re)load so the capture isn't blank.
  await Promise.all(
    imgs.map(
      (img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              const done = () => resolve();
              img.addEventListener("load", done, { once: true });
              img.addEventListener("error", done, { once: true });
              setTimeout(done, 4000);
            })
    )
  );

  try {
    return await run();
  } finally {
    imgs.forEach((img, i) => img.setAttribute("src", originals[i]));
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function captureElementToBlob(
  node: HTMLElement
): Promise<Blob | null> {
  const options = {
    pixelRatio: 2,
    backgroundColor: "#0b0f17",
    cacheBust: true,
  } as const;

  try {
    return await withProxiedImages(node, async () => {
      // Safari/iOS (and occasionally Chrome) render the first capture blank
      // because embedded images/fonts aren't inlined yet. Warm up, then
      // capture, and retry once if the result is suspiciously small.
      await toBlob(node, options);
      await delay(120);
      let blob = await toBlob(node, options);

      if (!blob || blob.size < 4096) {
        await delay(180);
        const retry = await toBlob(node, options);
        if (retry && (!blob || retry.size > blob.size)) blob = retry;
      }

      return blob;
    });
  } catch {
    return null;
  }
}

/**
 * Shares an image via the Web Share API (files) when supported, otherwise
 * downloads it. Returns the outcome so the UI can give feedback.
 */
export async function shareOrDownloadImage(
  blob: Blob,
  filename: string,
  text: string
): Promise<ImageShareOutcome> {
  const file = new File([blob], filename, { type: "image/png" });

  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };

  if (
    typeof nav.share === "function" &&
    typeof nav.canShare === "function" &&
    nav.canShare({ files: [file] })
  ) {
    try {
      await nav.share({ files: [file], text, title: "My Squadr XI", url: SHARE_URL });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return "cancelled";
      }
      // fall through to download
    }
  }

  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return "downloaded";
  } catch {
    return "failed";
  }
}
