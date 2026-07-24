import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/db";
import { ReservationForm } from "./reservation-form";

type ServiceWithPro = {
  id: string;
  professional_id: string;
  name: string;
  duration_minutes: number;
  price: number;
  professional: { id: string; full_name: string } | null;
};

type ProfessionalGroup = {
  professional: { id: string; full_name: string };
  services: { id: string; name: string; duration_minutes: number; price: number }[];
};

function groupServicesByProfessional(services: ServiceWithPro[]) {
  const grouped: Record<string, ProfessionalGroup> = {};

  for (const s of services) {
    if (!s.professional) continue;
    if (!grouped[s.professional_id]) {
      grouped[s.professional_id] = {
        professional: s.professional,
        services: [],
      };
    }
    grouped[s.professional_id].services.push({
      id: s.id,
      name: s.name,
      duration_minutes: s.duration_minutes,
      price: s.price,
    });
  }

  return Object.values(grouped);
}

export default async function ReservarPage({
  searchParams,
}: {
  searchParams: Promise<{ professional_id?: string; service_id?: string }>;
}) {
  const params = await searchParams;
  const user = await getUser();
  const supabase = await createClient();

  const { data: services } = await supabase
    .from("services")
    .select("*, professional:profiles!services_professional_id_fkey(id, full_name)")
    .eq("active", true);

  const { data: allSchedules } = await supabase
    .from("schedules")
    .select("*");

  const professionals = groupServicesByProfessional(
    (services || []) as ServiceWithPro[]
  ).map((pro) => ({
    ...pro,
    schedules: (allSchedules || []).filter(
      (sch) => sch.professional_id === pro.professional.id
    ),
  }));

  if (professionals.length === 0) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Reservar cita
        </h1>
        <p className="text-gray-500 dark:text-gray-500">
          No hay profesionales disponibles en este momento.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Reservar cita
      </h1>
      <ReservationForm
        professionals={professionals}
        userId={user!.id}
        preselectedPro={params.professional_id}
        preselectedSvc={params.service_id}
      />
    </div>
  );
}
