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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "cliente";

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
