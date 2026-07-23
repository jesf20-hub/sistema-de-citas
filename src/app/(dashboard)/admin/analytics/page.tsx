import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { AnalyticsCharts } from "./charts";

type Status = "pendiente" | "confirmada" | "cancelada" | "completada";

export default async function AnalyticsPage() {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  const supabase = await createClient();

  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("es-CO", { month: "short" });
    months.push({ key, label });
  }
  const monthKey = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };
  const yearAgo = new Date(
    now.getTime() - 365 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Appointments by status
  const { data: appointments } = await supabase
    .from("appointments")
    .select("status");
  const byStatus: Record<Status, number> = {
    pendiente: 0,
    confirmada: 0,
    cancelada: 0,
    completada: 0,
  };
  (appointments as { status: Status }[] | null)?.forEach((a) => {
    if (a.status in byStatus) byStatus[a.status]++;
  });
  const statusData = [
    { name: "Pendiente", value: byStatus.pendiente },
    { name: "Confirmada", value: byStatus.confirmada },
    { name: "Cancelada", value: byStatus.cancelada },
    { name: "Completada", value: byStatus.completada },
  ];

  // Monthly appointments (last 12 months)
  const { data: monthData } = await supabase
    .from("appointments")
    .select("created_at")
    .gte("created_at", yearAgo);
  const apptCounts: Record<string, number> = {};
  (monthData as { created_at: string }[] | null)?.forEach((a) => {
    const k = monthKey(a.created_at);
    apptCounts[k] = (apptCounts[k] || 0) + 1;
  });
  const monthlyAppointments = months.map((m) => ({
    month: m.label,
    count: apptCounts[m.key] || 0,
  }));

  // Top 5 most booked services (completed)
  const { data: topServicesData } = await supabase
    .from("appointments")
    .select("service_id, service:services(name)")
    .eq("status", "completada");
  const serviceCounts: Record<string, number> = {};
  (
    topServicesData as
      | { service: { name: string } | { name: string }[] | null }[]
      | null
  )?.forEach((row) => {
    const svc = Array.isArray(row.service) ? row.service[0] : row.service;
    const name = svc?.name;
    if (name) serviceCounts[name] = (serviceCounts[name] || 0) + 1;
  });
  const topServices = Object.entries(serviceCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Revenue (completed appointments)
  const { data: revenueAppts } = await supabase
    .from("appointments")
    .select("service:services(price), created_at")
    .eq("status", "completada");
  const revenueByMonth: Record<string, number> = {};
  let totalRevenue = 0;
  (
    revenueAppts as
      | {
          service: { price: number } | { price: number }[] | null;
          created_at: string;
        }[]
      | null
  )?.forEach((row) => {
    const svc = Array.isArray(row.service) ? row.service[0] : row.service;
    const price = svc?.price ?? 0;
    totalRevenue += price;
    const k = monthKey(row.created_at);
    revenueByMonth[k] = (revenueByMonth[k] || 0) + price;
  });
  const monthlyRevenue = months.map((m) => ({
    month: m.label,
    revenue: revenueByMonth[m.key] || 0,
  }));

  // New users per month (last 12 months)
  const { data: newUsers } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", yearAgo);
  const totalNewUsers = (newUsers as { created_at: string }[] | null)?.length ?? 0;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
        <Link
          href="/admin"
          className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          &larr; Volver al panel
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:shadow-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-500">Ingresos totales</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatPrice(totalRevenue)}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:shadow-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-500">Nuevos usuarios (12 meses)</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalNewUsers}</p>
        </div>
      </div>

      <AnalyticsCharts
        monthlyAppointments={monthlyAppointments}
        topServices={topServices}
        statusData={statusData}
        monthlyRevenue={monthlyRevenue}
      />
    </div>
  );
}
