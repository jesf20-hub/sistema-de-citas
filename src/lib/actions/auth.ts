"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signupSchema, loginSchema, profileUpdateSchema } from "@/lib/schemas";
import { audit, security } from "@/lib/logger";

export async function signup(
  _state: { error?: string } | undefined,
  formData: FormData
) {
  const supabase = await createServerClient();

  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    full_name: formData.get("full_name"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password, full_name, role } = parsed.data;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, role },
    },
  });

  if (error) {
    security("signup_failed", { email });
    return {
      error: error.status === 429
        ? "Demasiados intentos. Intenta de nuevo más tarde."
        : "Error al crear la cuenta",
    };
  }

  revalidatePath("/");
  redirect("/login?message=Revisa tu correo para confirmar la cuenta");
}

export async function login(
  _state: { error?: string } | undefined,
  formData: FormData
) {
  const supabase = await createServerClient();

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    security("login_failed", { email: parsed.data.email });
    return { error: "Credenciales inválidas" };
  }

  // Redirige a cada usuario a su panel segun su rol.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role = "cliente";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? "cliente";
  }

  revalidatePath("/");
  redirect(`/${role}`);
}

export async function updateProfile(formData: FormData) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };

  const parsed = profileUpdateSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone") || undefined,
    bio: formData.get("bio") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", user.id);

  if (error) return { error: "Error al actualizar el perfil" };

  audit(user.id, "profile_updated", { fields: Object.keys(parsed.data) });
  revalidatePath("/perfil");
  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) return { error: "No se seleccionó archivo" };

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) return { error: "La imagen no puede superar 5MB" };

  // Validacion por MIME declarado.
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Formato no permitido. Usa JPG, PNG o WebP" };
  }

  // Validacion por contenido real (magic bytes): impide subir un ejecutable o
  // SVG con scripts renombrado a .png (defensa contra XSS/almacenamiento hostil).
  const bytes = new Uint8Array(await file.arrayBuffer());
  const sniffed = sniffImageType(bytes);
  if (!sniffed) {
    return { error: "El archivo no es una imagen válida" };
  }

  const ext = sniffed === "image/jpeg" ? "jpg" : sniffed === "image/png" ? "png" : "webp";
  // El path se guarda bajo la carpeta del usuario para que la policy de storage
  // (storage.foldername(name))[1] = auth.uid() garantice la propiedad.
  const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { contentType: sniffed, upsert: false });

  if (uploadError) return { error: "Error al subir la imagen" };

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: urlData.publicUrl })
    .eq("id", user.id);

  if (updateError) return { error: "Error al actualizar el perfil" };

  audit(user.id, "avatar_uploaded");

  // Limpieza: borra avatares anteriores del usuario para no acumular basura.
  const { data: existing } = await supabase.storage.from("avatars").list(user.id);
  const stale = (existing ?? [])
    .map((f) => `${user.id}/${f.name}`)
    .filter((p) => p !== filePath);
  if (stale.length > 0) {
    await supabase.storage.from("avatars").remove(stale);
  }

  revalidatePath("/perfil");
  return { success: true, url: urlData.publicUrl };
}

// Detecta el tipo real de imagen por sus primeros bytes. Devuelve null si no
// corresponde a JPEG, PNG o WebP.
function sniffImageType(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes.length < 12) return null;
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  // WebP: "RIFF"...."WEBP"
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export async function logout() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
