import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { AdminSearch } from "./admin-search";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Profile[]>();

  const { count: totalAppts } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true });

  const { count: totalServices } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true });

  const { count: totalClients } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "cliente");

  const { count: totalProfessionals } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "profesional");

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Panel de Administración
        </h1>
        <Link
          href="/admin/analytics"
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
        >
          Ver analytics
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Clientes", value: totalClients },
          { label: "Profesionales", value: totalProfessionals },
          { label: "Servicios", value: totalServices },
          { label: "Citas totales", value: totalAppts },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:shadow-gray-900"
          >
            <p className="text-sm text-gray-500 dark:text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Usuarios</h2>
      <AdminSearch profiles={profiles || []} />
    </div>
  );
}
