import { resetPassword } from "@/actions/auth";
import { ActionForm } from "@/components/ui/ActionForm";
import { inputClass, labelClass } from "@/lib/ui";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
        <h1 className="font-display text-2xl font-bold">Reset your password</h1>
        <p className="mt-1 text-sm text-ink-soft">Choose a new password for your account.</p>

        <ActionForm action={resetPassword} submitLabel="Update Password" pendingLabel="Updating…" className="mt-5">
          <input type="hidden" name="token" value={token} />
          <div>
            <label className={labelClass}>New password</label>
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
      </div>
    </div>
  );
}
