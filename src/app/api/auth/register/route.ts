import { createClient } from "@/lib/supabase/server";
import { signupSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { email, password, full_name, role } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, role } },
  });

  if (error) {
    return Response.json({
      error: error.status === 429
        ? "Demasiados intentos. Intenta más tarde."
        : "Error al crear la cuenta",
    }, { status: 400 });
  }

  return Response.json({ success: true, message: "Cuenta creada. Ya puedes iniciar sesión." });
}
