import Link from "next/link";

import { registerUser } from "@/actions/auth";
import { ActionForm } from "@/components/ui/ActionForm";
import { inputClass, labelClass } from "@/lib/ui";
import { PUBLIC_REGISTRATION_ROLES, ROLE_LABELS } from "@/lib/constants";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  // The home page's "Sign up as a farmer / provider" buttons preselect the role.
  const { role } = await searchParams;
  const defaultRole = PUBLIC_REGISTRATION_ROLES.find((r) => r === role) ?? "";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
        <h1 className="font-display text-2xl font-bold">Sign Up · पंजीकरण</h1>
        <p className="mt-1 text-sm text-ink-soft">Create your Kheti Sehat account.</p>

        <ActionForm
          action={registerUser}
          submitLabel="Create Account"
          pendingLabel="Creating account…"
          className="mt-5"
        >
          <div>
            <label className={labelClass}>Full Name</label>
            <input name="name" required autoComplete="name" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>I am a</label>
            <select name="role" required defaultValue={defaultRole} className={inputClass}>
              <option value="" disabled>
                Choose an option…
              </option>
              {PUBLIC_REGISTRATION_ROLES.map((value) => (
                <option key={value} value={value}>
                  {ROLE_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Phone or Email</label>
            <input name="identifier" required autoComplete="username" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
        </ActionForm>

        <p className="mt-4 text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
