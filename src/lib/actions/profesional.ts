"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { serviceSchema, serviceUpdateSchema, scheduleSchema } from "@/lib/schemas";

async function requireProfessional(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No autorizado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["profesional", "admin"].includes(profile.role)) {
    throw new Error("No autorizado");
  }

  return user.id;
}

export async function createService(formData: FormData) {
  const supabase = await createClient();
  try {
    const userId = await requireProfessional(supabase);

    const parsed = serviceSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description") || undefined,
      duration_minutes: formData.get("duration_minutes"),
      price: formData.get("price"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { error } = await supabase.from("services").insert({
      professional_id: userId,
      ...parsed.data,
    });

    if (error) return { error: "Error al crear el servicio" };

    revalidatePath("/profesional/servicios");
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

export async function updateService(formData: FormData) {
  const supabase = await createClient();
  try {
    const userId = await requireProfessional(supabase);

    const parsed = serviceUpdateSchema.safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      description: formData.get("description") || undefined,
      duration_minutes: formData.get("duration_minutes"),
      price: formData.get("price"),
      active: formData.get("active"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { id, ...data } = parsed.data;

    const { error } = await supabase
      .from("services")
      .update(data)
      .eq("id", id)
      .eq("professional_id", userId);

    if (error) return { error: "Error al actualizar el servicio" };

    revalidatePath("/profesional/servicios");
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  try {
    const userId = await requireProfessional(supabase);
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", id)
      .eq("professional_id", userId);

    if (error) return { error: "Error al eliminar el servicio" };

    revalidatePath("/profesional/servicios");
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

export async function createSchedule(formData: FormData) {
  const supabase = await createClient();
  try {
    const userId = await requireProfessional(supabase);

    const parsed = scheduleSchema.safeParse({
      day_of_week: formData.get("day_of_week") || undefined,
      start_time: formData.get("start_time"),
      end_time: formData.get("end_time"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { error } = await supabase.from("schedules").upsert({
      professional_id: userId,
      ...parsed.data,
    });

    if (error) return { error: "Error al guardar el horario" };

    revalidatePath("/profesional/horarios");
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

export async function deleteSchedule(id: string) {
  const supabase = await createClient();
  try {
    const userId = await requireProfessional(supabase);
    const { error } = await supabase
      .from("schedules")
      .delete()
      .eq("id", id)
      .eq("professional_id", userId);

    if (error) return { error: "Error al eliminar el horario" };

    revalidatePath("/profesional/horarios");
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}
