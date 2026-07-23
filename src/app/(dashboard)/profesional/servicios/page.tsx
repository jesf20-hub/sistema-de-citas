import { getUser } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { ServiceForm, DeleteServiceButton } from "./service-buttons";
import type { Service } from "@/lib/types";

export default async function ServiciosPage() {
  const user = await getUser();
  const supabase = await createClient();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("professional_id", user!.id)
    .order("created_at", { ascending: false })
    .returns<Service[]>();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mis Servicios</h1>
        <ServiceForm />
      </div>

      {services && services.length > 0 ? (
        <div className="grid gap-4">
          {services.map((s) => (
            <div
              key={s.id}
              className="rounded-lg bg-white p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 dark:bg-gray-900 dark:border-gray-800 dark:shadow-gray-900"
            >
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{s.name}</h3>
                {s.description && (
                  <p className="text-sm text-gray-600 mt-1 dark:text-gray-400">{s.description}</p>
                )}
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-500">
                  <span>{s.duration_minutes} min</span>
                  <span>{formatPrice(s.price)}</span>
                  <span
                    className={s.active ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
                  >
                    {s.active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <ServiceForm service={s} />
                <DeleteServiceButton id={s.id} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-500">
            No tienes servicios creados. Agrega tu primer servicio.
          </p>
        </div>
      )}
    </div>
  );
}
