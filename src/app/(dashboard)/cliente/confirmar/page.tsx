import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ConfirmButton } from "./confirm-button";

export default async function ConfirmarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const professionalId = params.professional_id;
  const serviceId = params.service_id;
  const date = params.date;
  const startTime = params.start_time;
  const endTime = params.end_time;
  const notes = params.notes;

  if (!professionalId || !serviceId || !date || !startTime || !endTime) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Datos incompletos
        </h1>
        <p className="text-gray-500 dark:text-gray-500">
          Faltan algunos datos de la reserva. Por favor vuelve a intentarlo.
        </p>
        <Link
          href="/cliente/reservar"
          className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
        >
          Volver a reservar
        </Link>
      </div>
    );
  }

  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();

  const { data: professional } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", professionalId)
    .single();

  const { data: service } = await supabase
    .from("services")
    .select("name, duration_minutes, price")
    .eq("id", serviceId)
    .single();

  if (!professional || !service) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          No encontrado
        </h1>
        <p className="text-gray-500 dark:text-gray-500">
          El profesional o servicio seleccionado ya no est&aacute; disponible.
        </p>
        <Link
          href="/cliente/reservar"
          className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
        >
          Volver a reservar
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Confirmar reserva
      </h1>

      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800 dark:shadow-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Resumen de la cita
        </h2>

        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500 dark:text-gray-500">Profesional</dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {professional.full_name}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500 dark:text-gray-500">Servicio</dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {service.name}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500 dark:text-gray-500">Fecha</dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatDate(date)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500 dark:text-gray-500">Hora</dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {startTime} &ndash; {endTime}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500 dark:text-gray-500">Duraci&oacute;n</dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {service.duration_minutes} min
            </dd>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
            <dt className="text-sm font-semibold text-gray-700 dark:text-gray-300">Precio</dt>
            <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatPrice(service.price)}
            </dd>
          </div>
          {notes && (
            <div className="flex justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
              <dt className="text-sm text-gray-500 dark:text-gray-500">Notas</dt>
              <dd className="text-sm text-gray-700 dark:text-gray-300 max-w-[60%] text-right">
                {notes}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-8 flex items-center gap-4">
          <ConfirmButton
            professionalId={professionalId}
            serviceId={serviceId}
            date={date}
            startTime={startTime}
            endTime={endTime}
            notes={notes}
          />
          <Link
            href="/cliente/reservar"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}
