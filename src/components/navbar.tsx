import Link from "next/link";
import { getUserOrNull } from "@/lib/db";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Calendar, Clock, Scissors, Settings, User, LayoutDashboard } from "lucide-react";

export async function Navbar() {
  const user = await getUserOrNull();

  const linkClass =
    "inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors";
  const activeClass = "text-indigo-600 dark:text-indigo-400";

  return (
    <nav
      className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-900/80"
      aria-label="Navegación principal"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold text-indigo-600 dark:text-indigo-400 shrink-0 transition-opacity hover:opacity-80"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white text-sm font-bold">
                C
              </div>
              CitasPro
            </Link>
            {user && (
              <div className="hidden md:flex items-center gap-1">
                {user.role === "cliente" && (
                  <>
                    <Link href="/cliente" className={`${linkClass} rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800`}>
                      <Calendar className="h-4 w-4" />
                      Mis Citas
                    </Link>
                    <Link href="/cliente/calendario" className={`${linkClass} rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800`}>
                      <Clock className="h-4 w-4" />
                      Calendario
                    </Link>
                  </>
                )}
                {user.role === "profesional" && (
                  <>
                    <Link href="/profesional" className={`${linkClass} rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800`}>
                      <Calendar className="h-4 w-4" />
                      Citas
                    </Link>
                    <Link href="/profesional/calendario" className={`${linkClass} rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800`}>
                      <Clock className="h-4 w-4" />
                      Calendario
                    </Link>
                    <Link href="/profesional/servicios" className={`${linkClass} rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800`}>
                      <Scissors className="h-4 w-4" />
                      Servicios
                    </Link>
                    <Link href="/profesional/horarios" className={`${linkClass} rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800`}>
                      <Clock className="h-4 w-4" />
                      Horarios
                    </Link>
                  </>
                )}
                {user.role === "admin" && (
                  <Link href="/admin" className={`${linkClass} rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800`}>
                    <LayoutDashboard className="h-4 w-4" />
                    Panel Admin
                  </Link>
                )}
                <Link href="/perfil" className={`${linkClass} rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800`}>
                  <User className="h-4 w-4" />
                  Perfil
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <>
                <span className="hidden sm:inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                    {user.full_name.charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate max-w-[8rem]">{user.full_name}</span>
                </span>
                <ThemeToggle />
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Registrarse
                </Link>
                <ThemeToggle />
              </>
            )}
          </div>
        </div>
        {/* Mobile nav */}
        {user && (
          <div className="md:hidden flex items-center gap-1 overflow-x-auto pb-3 -mt-1 scrollbar-none">
            {user.role === "cliente" && (
              <>
                <Link href="/cliente" className={`${linkClass} rounded-md px-3 py-2 whitespace-nowrap`}>
                  <Calendar className="h-4 w-4" /> Mis Citas
                </Link>
                <Link href="/cliente/calendario" className={`${linkClass} rounded-md px-3 py-2 whitespace-nowrap`}>
                  <Clock className="h-4 w-4" /> Calendario
                </Link>
              </>
            )}
            {user.role === "profesional" && (
              <>
                <Link href="/profesional" className={`${linkClass} rounded-md px-3 py-2 whitespace-nowrap`}>
                  <Calendar className="h-4 w-4" /> Citas
                </Link>
                <Link href="/profesional/calendario" className={`${linkClass} rounded-md px-3 py-2 whitespace-nowrap`}>
                  <Clock className="h-4 w-4" /> Calendario
                </Link>
                <Link href="/profesional/servicios" className={`${linkClass} rounded-md px-3 py-2 whitespace-nowrap`}>
                  <Scissors className="h-4 w-4" /> Servicios
                </Link>
                <Link href="/profesional/horarios" className={`${linkClass} rounded-md px-3 py-2 whitespace-nowrap`}>
                  <Clock className="h-4 w-4" /> Horarios
                </Link>
              </>
            )}
            {user.role === "admin" && (
              <Link href="/admin" className={`${linkClass} rounded-md px-3 py-2 whitespace-nowrap`}>
                <LayoutDashboard className="h-4 w-4" /> Panel Admin
              </Link>
            )}
            <Link href="/perfil" className={`${linkClass} rounded-md px-3 py-2 whitespace-nowrap`}>
              <User className="h-4 w-4" /> Perfil
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
