import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json({ error: "Email y contraseña requeridos" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  // Determinar el rol para redirigir
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  return Response.json({
    success: true,
    role: profile?.role ?? "cliente",
    redirect: `/${profile?.role ?? "cliente"}`,
  });
}
