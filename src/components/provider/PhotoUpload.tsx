"use client";

import { useRef, useState } from "react";

import { labelClass } from "@/lib/ui";

/** Longest side after resizing — plenty for the directory card, small enough for slow rural networks. */
const MAX_SIDE = 1200;

/**
 * Profile photo picker: choose a file or take one with the phone camera, see
 * a preview, upload. The browser resizes (and rotates per EXIF) before
 * uploading. The resulting URL goes into a hidden `photoUrl` field that's
 * saved with the rest of the profile form.
 */
export function PhotoUpload({ initialUrl, name }: { initialUrl: string | null; name: string }) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function onPick(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setMessage("Please choose a photo (JPEG or PNG).");
      return;
    }
    setStatus("uploading");
    setMessage("");
    try {
      const resized = await resize(file);
      const body = new FormData();
      body.append("file", resized, "photo.jpg");
      const res = await fetch("/api/photos", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed — please try again");
      setUrl(data.url);
      setStatus("idle");
      setMessage("Photo uploaded — press Save below to keep it.");
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Upload failed — please try again");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className={labelClass}>Profile photo</label>
      <input type="hidden" name="photoUrl" value={url} />
      <div className="flex flex-wrap items-center gap-4">
        <div className="h-28 w-40 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-2">
          {url ? (
            // Uploaded photos and older external links — plain <img>, not next/image.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={`${name} profile`} className="h-full w-full object-cover object-top" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink-faint">No photo</div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => onPick(e.target.files?.[0])}
            className="hidden"
            id="photo-file"
          />
          <label
            htmlFor="photo-file"
            className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-deep"
          >
            {status === "uploading" ? "Uploading…" : url ? "Change photo" : "Upload photo"}
          </label>
          {url && status !== "uploading" && (
            <button
              type="button"
              onClick={() => {
                setUrl("");
                setMessage("Photo removed — press Save below to confirm.");
              }}
              className="text-left text-sm font-medium text-status-danger hover:underline"
            >
              Remove photo
            </button>
          )}
        </div>
      </div>
      <p className={`mt-2 text-xs ${status === "error" ? "text-status-danger" : "text-ink-faint"}`}>
        {message || "A clear photo of you or your equipment. On a phone you can take one with the camera."}
      </p>
    </div>
  );
}

/** Downscales to MAX_SIDE and re-encodes as JPEG; honours EXIF rotation from phone cameras. */
async function resize(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn't process this photo");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Couldn't process this photo"))), "image/jpeg", 0.85),
  );
}
