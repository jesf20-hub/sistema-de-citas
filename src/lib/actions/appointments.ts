"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { appointmentSchema, appointmentStatusSchema } from "@/lib/schemas";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  dayOfWeek,
  durationMinutes,
  isFutureOrToday,
  isWithinSchedule,
} from "@/lib/booking";
import { z } from "zod";

export async function createAppointment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };

  // Rate limit por usuario para evitar abuso/reservas masivas.
  const { success: withinLimit } = checkRateLimit(`appointment:${user.id}`, 15, 60);
  if (!withinLimit) {
    return { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." };
  }

  const parsed = appointmentSchema.safeParse({
    professional_id: formData.get("professional_id"),
    service_id: formData.get("service_id"),
    date: formData.get("date"),
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { professional_id, service_id, date, start_time, end_time } = parsed.data;

  // El fin debe ser posterior al inicio.
  if (durationMinutes(start_time, end_time) <= 0) {
    return { error: "La hora de fin debe ser posterior a la de inicio" };
  }

  // No se permiten citas en fechas pasadas.
  if (!isFutureOrToday(date)) {
    return { error: "No puedes reservar en una fecha pasada" };
  }

  // El servicio debe existir, estar activo y pertenecer al profesional indicado.
  const { data: service } = await supabase
    .from("services")
    .select("professional_id, duration_minutes, active")
    .eq("id", service_id)
    .single();

  if (!service || service.professional_id !== professional_id || !service.active) {
    return { error: "El servicio seleccionado no está disponible" };
  }

  // La duracion reservada debe coincidir con la del servicio.
  if (durationMinutes(start_time, end_time) !== service.duration_minutes) {
    return { error: "La duración no coincide con la del servicio" };
  }

  // La cita debe caer dentro del horario del profesional para ese dia.
  const { data: schedule } = await supabase
    .from("schedules")
    .select("start_time, end_time")
    .eq("professional_id", professional_id)
    .eq("day_of_week", dayOfWeek(date))
    .single();

  if (!schedule || !isWithinSchedule(start_time, end_time, schedule.start_time, schedule.end_time)) {
    return { error: "El profesional no atiende en ese horario" };
  }

  // Verificacion optimista de solapamiento (la barrera final es el constraint
  // EXCLUDE en la BD, que elimina la race condition del check-then-insert).
  const { data: conflicts, error: checkError } = await supabase
    .from("appointments")
    .select("id")
    .eq("professional_id", professional_id)
    .eq("date", date)
    .lt("start_time", end_time)
    .gt("end_time", start_time)
    .neq("status", "cancelada");

  if (checkError) return { error: "Error al verificar disponibilidad" };

  if (conflicts && conflicts.length > 0) {
    return { error: "El horario seleccionado ya está ocupado" };
  }

  const { error } = await supabase.from("appointments").insert({
    client_id: user.id,
    professional_id,
    service_id,
    date,
    start_time,
    end_time,
    notes: parsed.data.notes,
    status: "pendiente",
  });

  if (error) {
    // 23P01 = exclusion_violation: otra reserva gano la carrera.
    if (error.code === "23P01") {
      return { error: "El horario seleccionado ya está ocupado" };
    }
    return { error: "Error al crear la cita" };
  }

  revalidatePath("/cliente");
  return { success: true };
}

export async function updateAppointmentStatus(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };

  const parsed = appointmentStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["profesional", "admin"].includes(profile.role)) {
    return { error: "No autorizado" };
  }

  // Base de la actualizacion. Un profesional solo puede tocar SUS citas; un
  // admin puede cualquiera. RLS es la barrera final, pero filtramos aqui para
  // no depender unicamente de ella (defensa en profundidad).
  let query = supabase
    .from("appointments")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);

  if (profile.role === "profesional") {
    query = query.eq("professional_id", user.id);
  }

  const { error } = await query;

  if (error) return { error: "Error al actualizar la cita" };

  revalidatePath("/profesional");
  revalidatePath("/cliente");
  return { success: true };
}

export async function cancelAppointment(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };

  const parsed = z.string().uuid("ID de cita inválido").safeParse(id);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("appointments")
    .update({ status: "cancelada" })
    .eq("id", id)
    .eq("client_id", user.id);

  if (error) return { error: "Error al cancelar la cita" };

  revalidatePath("/cliente");
  return { success: true };
}
