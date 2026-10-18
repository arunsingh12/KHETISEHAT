"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import type { ActionResult } from "@/lib/types";

export async function loginAction(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await signIn("credentials", {
      identifier: formData.get("identifier"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Incorrect phone/email or password" };
    }
    throw error; // re-throw NEXT_REDIRECT and anything unexpected
  }
}
