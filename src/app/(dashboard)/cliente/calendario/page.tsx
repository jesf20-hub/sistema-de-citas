import { getUser } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { Calendar } from "@/components/calendar/calendar";
import Link from "next/link";
import type { Appointment } from "@/lib/types";

export default async function ClienteCalendarioPage() {
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
    <div>
      <div className="mb-6">
        <Link href="/cliente" className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
          &larr; Volver a mis citas
        </Link>
      </div>
      <Calendar
        appointments={appointments || []}
        view="cliente"
      />
    </div>
  );
}
