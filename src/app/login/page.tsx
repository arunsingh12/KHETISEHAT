import Link from "next/link";

import { loginAction } from "@/actions/login";
import { ActionForm } from "@/components/ui/ActionForm";
import { inputClass, labelClass } from "@/lib/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; reset?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
        <h1 className="font-display text-2xl font-bold">Log In · लॉग इन</h1>
        <p className="mt-1 text-sm text-ink-soft">Welcome back to Kheti Sehat.</p>
        {sp.registered && (
          <p className="mt-3 rounded-lg bg-status-active-bg px-3 py-2 text-sm text-status-active">
            Account created — log in below.
          </p>
        )}
        {sp.reset && (
          <p className="mt-3 rounded-lg bg-status-active-bg px-3 py-2 text-sm text-status-active">
            Password updated — log in with your new password.
          </p>
        )}

        <ActionForm action={loginAction} submitLabel="Log In" pendingLabel="Logging in…" className="mt-5">
          <div>
            <label className={labelClass}>Phone or email</label>
            <input name="identifier" required autoComplete="username" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
          </div>
          <div className="text-right">
            <Link href="/forgot-password" className="text-xs font-medium text-brand hover:underline">
              Forgot password?
            </Link>
          </div>
        </ActionForm>

        <p className="mt-4 text-center text-sm text-ink-soft">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-brand hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
