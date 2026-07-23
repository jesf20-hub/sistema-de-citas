"use client";

import { updateAppointmentStatus } from "@/lib/actions/appointments";

export function StatusButton({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const labels: Record<string, string> = {
    confirmada: "Confirmar",
    cancelada: "Rechazar",
    completada: "Completar",
  };

  const colors: Record<string, string> = {
    confirmada: "bg-green-600 hover:bg-green-700",
    cancelada: "bg-red-600 hover:bg-red-700",
    completada: "bg-blue-600 hover:bg-blue-700",
  };

  return (
    <form
      action={async (formData: FormData) => {
        await updateAppointmentStatus(formData);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={`rounded-md px-3 py-1 text-xs text-white whitespace-nowrap ${colors[status]}`}
      >
        {labels[status]}
      </button>
    </form>
  );
}
