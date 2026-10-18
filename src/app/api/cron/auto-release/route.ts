import { NextResponse } from "next/server";

import { runAutoConfirm } from "@/lib/escrow";

/**
 * The 72-hour auto-confirm from docs/payment-module.md: jobs the farmer
 * hasn't confirmed or disputed are confirmed for them and join the admin's
 * payout approval queue (nothing is paid out here). Point a
 * scheduler (Vercel Cron, GitHub Actions, cron-job.org, ...) at this route
 * every 15-30 minutes with `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runAutoConfirm();
  return NextResponse.json(result);
}
