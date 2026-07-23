import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { checkRateLimit } from "@/lib/rate-limit";

const authRoutes = ["/login", "/register"];

// Mapa de prefijo de ruta -> roles autorizados.
const routeRoles: { prefix: string; roles: string[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/profesional", roles: ["profesional", "admin"] },
  { prefix: "/cliente", roles: ["cliente", "profesional", "admin"] },
  { prefix: "/perfil", roles: ["cliente", "profesional", "admin"] },
];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const matched = routeRoles.find((r) => path.startsWith(r.prefix));
  const isProtectedRoute = Boolean(matched);
  const isAuthRoute = authRoutes.some((r) => path.startsWith(r));

  if (isAuthRoute) {
    const ip = getClientIp(req);
    const { success } = checkRateLimit(`auth:${ip}`, 10, 60);
    if (!success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." },
        { status: 429 }
      );
    }
  }

  // IMPORTANTE: la respuesta debe crearse aqui y las cookies refrescadas por
  // Supabase deben escribirse tanto en la request como en la response, de lo
  // contrario los tokens nunca se renuevan y la sesion expira antes de tiempo.
  let response = NextResponse.next({ request: req });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            req.cookies.set(name, value);
          }
          response = NextResponse.next({ request: req });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // Si Supabase no responde (sin conexión, URL inválida), dejamos pasar las
  // peticiones a rutas públicas y redirigimos solo las protegidas a /login.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user ?? null;
  } catch {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return response;
  }

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (user) {
    let role = "cliente";
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      role = profile?.role ?? "cliente";
    } catch {
      // Si no podemos consultar profiles (DB offline), asumimos cliente.
    }

    // Usuario autenticado en rutas de auth -> a su dashboard.
    if (isAuthRoute) {
      return NextResponse.redirect(new URL(`/${role}`, req.url));
    }

    // Guard de autorizacion por rol (defensa en profundidad; RLS es la ultima
    // barrera, pero no debemos servir siquiera la pagina a un rol no autorizado).
    if (matched && !matched.roles.includes(role)) {
      return NextResponse.redirect(new URL(`/${role}`, req.url));
    }
  }

  return response;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // Solo la primera IP (cliente real); el resto puede ser spoofeado.
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
