"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

type Professional = {
  professional: { id: string; full_name: string };
  services: { id: string; name: string; duration_minutes: number; price: number }[];
  schedules?: { day_of_week: number; start_time: string; end_time: string }[];
};

export function ReservationForm({
  professionals,
}: {
  professionals: Professional[];
  userId: string;
}) {
  const router = useRouter();
  const [selectedPro, setSelectedPro] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const pro = professionals.find((p) => p.professional.id === selectedPro);
  const service = pro?.services.find((s) => s.id === selectedService);

  const getAvailableSlots = useCallback(() => {
    if (!pro || !service || !selectedDate) return [];
    const date = new Date(selectedDate + "T00:00:00");
    const dayOfWeek = date.getDay();

    const schedule = pro.schedules?.find((s) => s.day_of_week === dayOfWeek);
    if (!schedule) return [];

    const slots: string[] = [];
    let [h, m] = schedule.start_time.split(":").map(Number);
    const [endH, endM] = schedule.end_time.split(":").map(Number);
    const duration = service.duration_minutes;

    while (h < endH || (h === endH && m < endM)) {
      const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const slotEndMin = m + duration;
      const slotEndHr = h + Math.floor(slotEndMin / 60);
      const slotEndMr = slotEndMin % 60;

      if (
        slotEndHr < endH ||
        (slotEndHr === endH && slotEndMr <= endM)
      ) {
        slots.push(timeStr);
      }

      m += 60;
      if (m >= 60) {
        h += 1;
        m -= 60;
      }
    }

    return slots;
  }, [pro, service, selectedDate]);

  const availableSlots = getAvailableSlots();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedPro || !selectedService || !selectedDate || !selectedTime) {
      setError("Completa todos los campos requeridos");
      return;
    }

    const [h, m] = selectedTime.split(":").map(Number);
    const endMin = m + (service?.duration_minutes || 60);
    const endHr = h + Math.floor(endMin / 60);
    const endMr = endMin % 60;
    const endTime = `${String(endHr).padStart(2, "0")}:${String(endMr).padStart(2, "0")}`;

    const params = new URLSearchParams({
      professional_id: selectedPro,
      service_id: selectedService,
      date: selectedDate,
      start_time: selectedTime,
      end_time: endTime,
      ...(notes ? { notes } : {}),
    });

    router.push(`/cliente/confirmar?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 max-w-2xl">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400" role="alert" aria-live="polite">{error}</div>
      )}

      <div>
        <label htmlFor="pro-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Profesional
        </label>
        <select
          id="pro-select"
          value={selectedPro}
          onChange={(e) => {
            setSelectedPro(e.target.value);
            setSelectedService("");
            setSelectedDate("");
            setSelectedTime("");
          }}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="">Seleccionar profesional</option>
          {professionals.map((p) => (
            <option key={p.professional.id} value={p.professional.id}>
              {p.professional.full_name}
            </option>
          ))}
        </select>
      </div>

      {pro && (
        <div>
        <label htmlFor="svc-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Servicio
        </label>
        <select
          id="svc-select"
          value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value);
              setSelectedDate("");
              setSelectedTime("");
            }}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">Seleccionar servicio</option>
            {pro.services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} - {s.duration_minutes}min - {formatPrice(s.price)}
              </option>
            ))}
          </select>
        </div>
      )}

      {service && (
        <div>
          <label htmlFor="res-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha
          </label>
          <input
            id="res-date"
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedTime("");
            }}
            min={new Date().toISOString().split("T")[0]}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      )}

      {selectedDate && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hora disponible
          </label>
          {availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    selectedTime === slot
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                      : "border-gray-300 hover:border-indigo-400 dark:border-gray-700 dark:text-gray-200 dark:hover:border-indigo-500"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-500">
              No hay horarios disponibles para esta fecha. Elige otra fecha.
            </p>
          )}
        </div>
      )}

      {selectedTime && (
        <div>
          <label htmlFor="res-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notas (opcional)
          </label>
          <textarea
            id="res-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            placeholder="Ej: Prefiero color oscuro, tengo el cabello largo\u2026"
          />
        </div>
      )}

      {selectedTime && (
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Confirmar reserva
        </button>
      )}
    </form>
  );
}
