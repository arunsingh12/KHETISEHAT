import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** After the browser resizes it, a photo is ~100–400 KB; anything over this is refused. */
const MAX_BYTES = 3 * 1024 * 1024;

/** Detects the real image type from the file's first bytes — the name/MIME the browser sends can't be trusted. */
function sniffImageType(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  return null;
}

/**
 * Upload a profile photo. Farmers and providers upload their own; admins and
 * coordinators upload for people they manage. Returns the URL to save as photoUrl.
 */
export async function POST(request: Request) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || !role) {
    return NextResponse.json({ error: "Please log in to upload a photo" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ error: "Choose a photo to upload" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "That photo is too large — please choose a smaller one" }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType = sniffImageType(bytes);
  if (!contentType) {
    return NextResponse.json({ error: "Only JPEG, PNG or WebP photos can be uploaded" }, { status: 415 });
  }

  const photo = await prisma.photo.create({
    data: { data: bytes, contentType, size: bytes.length, uploadedById: session.user.id },
    select: { id: true },
  });
  return NextResponse.json({ url: `/api/photos/${photo.id}` });
}
