/** Common return shape for server actions used with useActionState. */
export type ActionResult = { ok: true } | { ok: false; error: string };
