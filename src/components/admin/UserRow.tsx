"use client";

import { useActionState, useRef } from "react";

import { toggleUserActiveAction, updateUserRoleAction } from "@/actions/admin";
import { Badge } from "@/components/ui/Badge";
import { ROLE_LABELS } from "@/lib/constants";
import { inputClass } from "@/lib/ui";
import type { Role } from "@/generated/prisma/enums";

export function UserRow({
  user,
  isSelf,
}: {
  user: { id: string; name: string; email: string | null; phone: string | null; role: Role; active: boolean };
  isSelf: boolean;
}) {
  const [state, formAction] = useActionState(updateUserRoleAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <tr className="border-b border-line-soft last:border-0">
      <td className="px-4 py-3">
        <p className="font-medium">
          {user.name} {isSelf && <span className="text-xs text-ink-faint">(you)</span>}
        </p>
        <p className="text-xs text-ink-faint">{user.email ?? user.phone ?? "—"}</p>
      </td>
      <td className="px-4 py-3">
        <form ref={formRef} action={formAction} className="inline-flex items-center gap-2">
          <input type="hidden" name="userId" value={user.id} />
          <select
            name="role"
            defaultValue={user.role}
            disabled={isSelf}
            onChange={() => formRef.current?.requestSubmit()}
            className={inputClass + " w-auto py-1.5 text-xs"}
          >
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </form>
        {state && !state.ok && <p className="mt-1 text-xs text-status-danger">{state.error}</p>}
      </td>
      <td className="px-4 py-3">
        {user.active ? <Badge tone="active">Active</Badge> : <Badge tone="danger">Disabled</Badge>}
      </td>
      <td className="px-4 py-3">
        <form action={toggleUserActiveAction}>
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="active" value={(!user.active).toString()} />
          <button
            type="submit"
            disabled={isSelf}
            className="text-xs font-medium text-brand underline disabled:text-ink-faint disabled:no-underline"
          >
            {user.active ? "Disable" : "Enable"}
          </button>
        </form>
      </td>
    </tr>
  );
}
