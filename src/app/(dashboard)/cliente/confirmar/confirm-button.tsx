"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createAppointment } from "@/lib/actions/appointments";

type ConfirmButtonProps = {
  professionalId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
};

export function ConfirmButton({
  professionalId,
  serviceId,
  date,
  startTime,
  endTime,
  notes,
}: ConfirmButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);

    const formData = new FormData();
    formData.append("professional_id", professionalId);
    formData.append("service_id", serviceId);
    formData.append("date", date);
    formData.append("start_time", startTime);
    formData.append("end_time", endTime);
    if (notes) formData.append("notes", notes);

    const result = await createAppointment(formData);

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("¡Cita reservada con éxito!");
      setTimeout(() => {
        window.location.href = "/cliente";
      }, 800);
    }
  }

  return (
    <button
      type="button"
      onClick={handleConfirm}
      disabled={loading}
      className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
    >
      {loading ? "Reservando\u2026" : "Confirmar y reservar"}
    </button>
  );
}
