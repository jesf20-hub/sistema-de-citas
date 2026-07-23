import { createClient as createServerClient } from "@/lib/supabase/server";
import { appointmentSchema, appointmentStatusSchema } from "@/lib/schemas";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  dayOfWeek,
  durationMinutes,
  isFutureOrToday,
  isWithinSchedule,
} from "@/lib/booking";
import { audit } from "@/lib/logger";

async function getSupabase() {
  return createServerClient();
}

async function requireAuth() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();
  if (!profile) throw new Error("Perfil no encontrado");
  return { user, profile };
}

async function requireRole(roles: string[]) {
  const { profile } = await requireAuth();
  if (!roles.includes(profile.role)) throw new Error("No autorizado");
  return profile;
}

export const resolvers = {
  Query: {
    me: async () => {
      const { profile } = await requireAuth();
      return { ...profile, id: profile.id };
    },
    professionals: async (_: unknown, { search }: { search?: string }) => {
      const supabase = await getSupabase();
      let q = supabase.from("profiles").select("*").eq("role", "profesional");
      if (search) q = q.ilike("full_name", `%${search}%`);
      const { data } = await q.order("full_name");
      return data ?? [];
    },
    services: async (_: unknown, { professionalId, active }: { professionalId?: string; active?: boolean }) => {
      const supabase = await getSupabase();
      let q = supabase.from("services").select("*, professional:profiles!services_professional_id_fkey(id, full_name)");
      if (professionalId) q = q.eq("professional_id", professionalId);
      if (active !== undefined) q = q.eq("active", active);
      const { data } = await q.order("name");
      return data ?? [];
    },
    schedules: async (_: unknown, { professionalId }: { professionalId: string }) => {
      const supabase = await getSupabase();
      const { data } = await supabase.from("schedules").select("*").eq("professional_id", professionalId).order("day_of_week");
      return data ?? [];
    },
    myAppointments: async (_: unknown, args: { status?: string; from?: string; to?: string }) => {
      const { user, profile } = await requireAuth();
      const supabase = await getSupabase();
      const col = profile.role === "profesional" ? "professional_id" : "client_id";
      let q = supabase
        .from("appointments")
        .select("*, service:services(name, price), client:profiles!appointments_client_id_fkey(full_name), professional:profiles!appointments_professional_id_fkey(full_name)")
        .eq(col, user.id)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });
      if (args.status) q = q.eq("status", args.status);
      if (args.from) q = q.gte("date", args.from);
      if (args.to) q = q.lte("date", args.to);
      const { data } = await q;
      return data ?? [];
    },
    allProfiles: async (_: unknown, { role }: { role?: string }) => {
      await requireRole(["admin"]);
      const supabase = await getSupabase();
      let q = supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (role) q = q.eq("role", role);
      const { data } = await q;
      return data ?? [];
    },
    metrics: async () => {
      await requireRole(["admin"]);
      const supabase = await getSupabase();
      const [{ count: totalAppts }, { count: totalServices }, { count: totalClients }, { count: totalProfessionals }] = await Promise.all([
        supabase.from("appointments").select("*", { count: "exact", head: true }),
        supabase.from("services").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "cliente"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "profesional"),
      ]);
      return { totalAppts, totalServices, totalClients, totalProfessionals };
    },
  },

  Mutation: {
    createAppointment: async (_: unknown, { input }: { input: Record<string, unknown> }) => {
      const { user } = await requireAuth();
      const supabase = await getSupabase();

      const { success: withinLimit } = checkRateLimit(`gql:appointment:${user.id}`, 15, 60);
      if (!withinLimit) return { success: false, error: "Demasiadas solicitudes" };

      const parsed = appointmentSchema.safeParse(input);
      if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

      const { professional_id, service_id, date, start_time, end_time, notes } = parsed.data;
      if (durationMinutes(start_time, end_time) <= 0) return { success: false, error: "Hora fin debe ser posterior a inicio" };
      if (!isFutureOrToday(date)) return { success: false, error: "No puedes reservar en fecha pasada" };

      const { data: service } = await supabase.from("services").select("professional_id, duration_minutes, active").eq("id", service_id).single();
      if (!service || service.professional_id !== professional_id || !service.active) return { success: false, error: "Servicio no disponible" };
      if (durationMinutes(start_time, end_time) !== service.duration_minutes) return { success: false, error: "Duración no coincide con el servicio" };

      const { data: schedule } = await supabase.from("schedules").select("start_time, end_time").eq("professional_id", professional_id).eq("day_of_week", dayOfWeek(date)).single();
      if (!schedule || !isWithinSchedule(start_time, end_time, schedule.start_time, schedule.end_time)) return { success: false, error: "Horario no disponible" };

      const { data: conflicts } = await supabase.from("appointments").select("id").eq("professional_id", professional_id).eq("date", date).lt("start_time", end_time).gt("end_time", start_time).neq("status", "cancelada");
      if (conflicts && conflicts.length > 0) return { success: false, error: "Horario ya ocupado" };

      const { data: inserted, error } = await supabase.from("appointments").insert({
        client_id: user.id, professional_id, service_id, date, start_time, end_time, notes, status: "pendiente",
      }).select("*, service:services(name, price)").single();

      if (error) {
        if (error.code === "23P01") return { success: false, error: "Horario ya ocupado" };
        return { success: false, error: "Error al crear la cita" };
      }

      audit(user.id, "gql_appointment_created", { professional_id, service_id, date });
      return { success: true, appointment: inserted };
    },

    cancelAppointment: async (_: unknown, { id }: { id: string }) => {
      const { user } = await requireAuth();
      const supabase = await getSupabase();
      const { data: updated, error } = await supabase.from("appointments").update({ status: "cancelada" }).eq("id", id).eq("client_id", user.id).select("*, service:services(name, price)").single();
      if (error || !updated) return { success: false, error: "No se pudo cancelar la cita" };
      audit(user.id, "gql_appointment_cancelled", { appointment_id: id });
      return { success: true, appointment: updated };
    },

    updateAppointmentStatus: async (_: unknown, { id, status }: { id: string; status: string }) => {
      const { user, profile } = await requireAuth();
      if (!["profesional", "admin"].includes(profile.role)) return { success: false, error: "No autorizado" };
      const supabase = await getSupabase();

      const parsed = appointmentStatusSchema.safeParse({ id, status });
      if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

      let q = supabase.from("appointments").update({ status: parsed.data.status }).eq("id", parsed.data.id);
      if (profile.role === "profesional") q = q.eq("professional_id", user.id);

      const { data: updated, error } = await q.select("*, service:services(name, price)").single();
      if (error || !updated) return { success: false, error: "No se pudo actualizar" };

      audit(user.id, "gql_status_updated", { appointment_id: id, new_status: status });
      return { success: true, appointment: updated };
    },
  },
};
