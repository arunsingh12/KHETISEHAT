"use client";

import { deleteHospitalAction } from "@/actions/admin";

export function DeleteHospitalButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteHospitalAction}
      onSubmit={(e) => {
        if (!window.confirm(`Remove ${name} from the directory?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-sm font-medium text-status-danger hover:underline">
        Delete
      </button>
    </form>
  );
}
