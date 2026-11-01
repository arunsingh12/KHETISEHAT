import { prisma } from "@/lib/prisma";

/** Serves an uploaded photo. Photos never change (a new upload gets a new id), so they cache forever. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9]{20,40}$/.test(id)) return new Response("Not found", { status: 404 });

  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(photo.data), {
    headers: {
      "Content-Type": photo.contentType,
      "Content-Length": String(photo.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
