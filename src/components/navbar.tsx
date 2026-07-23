import Link from "next/link";
import { getUserOrNull } from "@/lib/db";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";

export async function Navbar() {
  const user = await getUserOrNull();

  return (
    <nav
      className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
      aria-label="Navegación principal"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center gap-2">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <Link href="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
              CitasPro
            </Link>
            {user && (
              <div className="hidden md:flex items-center gap-4 sm:gap-6">
                {user.role === "cliente" && (
                  <>
                    <Link
                      href="/cliente"
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      Mis Citas
                    </Link>
                    <Link
                      href="/cliente/calendario"
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      Calendario
                    </Link>
                  </>
                )}
                {user.role === "profesional" && (
                  <>
                    <Link
                      href="/profesional"
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      Citas
                    </Link>
                    <Link
                      href="/profesional/calendario"
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      Calendario
                    </Link>
                    <Link
                      href="/profesional/servicios"
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      Servicios
                    </Link>
                    <Link
                      href="/profesional/horarios"
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      Horarios
                    </Link>
                  </>
                )}
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  >
                    Panel Admin
                  </Link>
                )}
                <Link
                  href="/perfil"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  Perfil
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400 truncate max-w-[10rem]">
                  {user.full_name} ({user.role})
                </span>
                <ThemeToggle />
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
                >
                  Registrarse
                </Link>
                <ThemeToggle />
              </>
            )}
          </div>
        </div>
        {user && (
          <div className="md:hidden flex items-center gap-4 overflow-x-auto pb-2 -mt-1">
            {user.role === "cliente" && (
              <>
                <Link href="/cliente" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 whitespace-nowrap">
                  Mis Citas
                </Link>
                <Link href="/cliente/calendario" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 whitespace-nowrap">
                  Calendario
                </Link>
              </>
            )}
            {user.role === "profesional" && (
              <>
                <Link href="/profesional" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 whitespace-nowrap">
                  Citas
                </Link>
                <Link href="/profesional/calendario" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 whitespace-nowrap">
                  Calendario
                </Link>
                <Link href="/profesional/servicios" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 whitespace-nowrap">
                  Servicios
                </Link>
                <Link href="/profesional/horarios" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 whitespace-nowrap">
                  Horarios
                </Link>
              </>
            )}
            {user.role === "admin" && (
              <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 whitespace-nowrap">
                Panel Admin
              </Link>
            )}
            <Link href="/perfil" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 whitespace-nowrap">
              Perfil
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
