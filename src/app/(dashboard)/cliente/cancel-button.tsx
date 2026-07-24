"use client";

import { useState } from "react";
import { toast } from "sonner";

type CancelButtonProps = { appointmentId: string };

export function CancelButton({ appointmentId }: CancelButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setLoading(true);
    const formData = new FormData();
    formData.append("_action", "cancel");
    formData.append("id", appointmentId);

    const res = await fetch("/api/appointments", { method: "POST", body: formData });
    const result = await res.json();

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Cita cancelada");
      setTimeout(() => window.location.reload(), 600);
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={loading}
      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {loading ? "Cancelando..." : "Cancelar"}
    </button>
  );
}
