import { getUser } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate, formatTime, getStatusColor } from "@/lib/utils";
import { StatusButton } from "./status-button";
import { RealtimeWrapper } from "./realtime-wrapper";
import type { Appointment } from "@/lib/types";

export default async function ProfesionalDashboardPage() {
  const user = await getUser();
  const supabase = await createClient();

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*, service:services(name), client:profiles!appointments_client_id_fkey(full_name)")
    .eq("professional_id", user!.id)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
    .returns<Appointment[]>();

  const pending = appointments?.filter((a) => a.status === "pendiente") || [];
  const upcoming = appointments?.filter(
    (a) => a.status === "confirmada" || a.status === "pendiente"
  ) || [];
  const past = appointments?.filter(
    (a) => a.status === "completada" || a.status === "cancelada"
  ) || [];

  return (
    <RealtimeWrapper professionalId={user!.id}>
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mis Citas</h1>
        <Link
          href="/profesional/calendario"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Ver calendario
        </Link>
      </div>

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-yellow-700 dark:text-yellow-500 mb-3">
            Pendientes de confirmar ({pending.length})
          </h2>
          <div className="grid gap-4">
            {pending.map((appt) => (
              <div
                key={appt.id}
                className="rounded-lg bg-white p-5 shadow-sm border border-yellow-200 dark:bg-gray-900 dark:border-yellow-900/40 dark:shadow-gray-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {appt.client?.full_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{appt.service?.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusButton id={appt.id} status="confirmada" />
                    <StatusButton id={appt.id} status="cancelada" />
                  </div>
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
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Próximas citas
        </h2>
        {upcoming.length > 0 ? (
          <div className="grid gap-4">
            {upcoming.map((appt) => (
              <div
                key={appt.id}
                className="rounded-lg bg-white p-5 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:shadow-gray-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {appt.client?.full_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{appt.service?.name}</p>
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
                {appt.status === "confirmada" && (
                  <div className="mt-3">
                    <StatusButton id={appt.id} status="completada" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-500">No hay próximas citas</p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Historial
        </h2>
        {past.length > 0 ? (
          <div className="grid gap-4">
            {past.map((appt) => (
              <div
                key={appt.id}
                className="rounded-lg bg-white p-5 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:shadow-gray-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {appt.client?.full_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{appt.service?.name}</p>
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
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-500">No hay historial</p>
        )}
      </div>
    </div>
    </RealtimeWrapper>
  );
}
