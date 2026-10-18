import Link from "next/link";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
        <h1 className="font-display text-2xl font-bold">Reset your password</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Enter the phone number or email on your account and we&apos;ll send a reset link.
        </p>
        <ForgotPasswordForm />
        <p className="mt-4 text-center text-sm text-ink-soft">
          <Link href="/login" className="font-medium text-brand hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
