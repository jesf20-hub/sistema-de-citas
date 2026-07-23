import { getUser } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate, formatTime, getStatusColor } from "@/lib/utils";
import { CancelButton } from "./cancel-button";
import { RealtimeWrapper } from "./realtime-wrapper";
import type { Appointment } from "@/lib/types";

export default async function ClienteDashboardPage() {
  const user = await getUser();
  const supabase = await createClient();

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*, service:services(name, price), professional:profiles!appointments_professional_id_fkey(full_name)")
    .eq("client_id", user!.id)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
    .returns<Appointment[]>();

  return (
    <RealtimeWrapper clientId={user!.id}>
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mis Citas</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            href="/cliente/calendario"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-center dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Ver calendario
          </Link>
          <Link
            href="/cliente/reservar"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 text-center"
          >
            Reservar nueva cita
          </Link>
        </div>
      </div>

      {appointments && appointments.length > 0 ? (
        <div className="grid gap-4">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="rounded-lg bg-white p-5 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:shadow-gray-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {appt.service?.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {appt.professional?.full_name}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(appt.status)}`}
                >
                  {appt.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 sm:gap-6 text-sm text-gray-600 dark:text-gray-400">
                <span>{formatDate(appt.date)}</span>
                <span>
                  {formatTime(appt.start_time)} - {formatTime(appt.end_time)}
                </span>
              </div>
              {appt.notes && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Notas: {appt.notes}</p>
              )}
              {(appt.status === "pendiente" || appt.status === "confirmada") && (
                <div className="mt-3">
                  <CancelButton id={appt.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-500 mb-4">No tienes citas agendadas</p>
          <Link
            href="/cliente/reservar"
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium"
          >
            Reserva tu primera cita
          </Link>
        </div>
      )}
    </div>
    </RealtimeWrapper>
  );
}
