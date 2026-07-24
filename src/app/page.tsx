import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { Scissors, Sparkles, Clock, ChevronRight, Star } from "lucide-react";

const serviceIcons: Record<string, React.ReactNode> = {
  corte: <Scissors className="h-5 w-5" />,
  masaje: <Sparkles className="h-5 w-5" />,
  manicure: <Sparkles className="h-5 w-5" />,
  default: <Star className="h-5 w-5" />,
};

function getIcon(name: string) {
  const key = Object.keys(serviceIcons).find((k) => name.toLowerCase().includes(k));
  return serviceIcons[key ?? "default"];
}

export default async function HomePage() {
  const supabase = await createClient();

  const { data: services } = await supabase
    .from("services")
    .select("*, professional:profiles!services_professional_id_fkey(full_name, id, avatar_url)")
    .eq("active", true)
    .order("name");

  const grouped: Record<string, { name: string; id: string; avatar?: string; services: NonNullable<typeof services> }> = {};
  const svcList = services ?? [];
  for (const s of svcList) {
    const prof = Array.isArray(s.professional) ? s.professional[0] : s.professional;
    const profName = (prof as { full_name?: string; id?: string; avatar_url?: string } | null)?.full_name ?? "Profesional";
    const profId = (prof as { full_name?: string; id?: string } | null)?.id ?? "";
    const avatar = (prof as { full_name?: string; id?: string; avatar_url?: string } | null)?.avatar_url;
    if (!grouped[profId]) {
      grouped[profId] = { name: profName, id: profId, avatar, services: [] };
    }
    grouped[profId].services.push(s);
  }

  const professionals = Object.values(grouped);

  return (
    <div className="-mt-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-b-[2rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 px-4 py-20 sm:py-28 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl text-balance animate-fade-in">
            Reserva tu cita en minutos
          </h1>
          <p className="mt-6 text-lg leading-8 text-indigo-100 text-balance animate-slide-up">
            Encuentra profesionales de confianza y agenda tus servicios de belleza, salud y bienestar.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link
              href="/register"
              className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-indigo-700 shadow-lg hover:bg-indigo-50 transition-all hover:scale-105 inline-flex items-center gap-2"
            >
              Crear cuenta gratis
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-indigo-300/40 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-all inline-flex items-center gap-2"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16">
        {professionals.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/20">
              <Sparkles className="h-10 w-10 text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Aún no hay servicios</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Sé el primer profesional en ofrecer tus servicios en CitasPro.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Registrarse como profesional
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            {professionals.map((prof) => (
              <div key={prof.id} className="animate-fade-in">
                <div className="mb-8 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-lg font-bold text-indigo-700 dark:text-indigo-300 shrink-0">
                    {prof.avatar ? (
                      <img
                        src={prof.avatar}
                        alt={prof.name}
                        className="h-12 w-12 rounded-full object-cover"
                        width={48}
                        height={48}
                      />
                    ) : (
                      prof.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {prof.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {prof.services.length} servicio{prof.services.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Link
                    href={`/cliente/reservar?professional_id=${prof.id}`}
                    className="shrink-0 rounded-lg border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/20 transition-colors"
                  >
                    Ver agenda
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {prof.services?.map((svc) => (
                    <Link
                      key={svc.id}
                      href={`/cliente/reservar?professional_id=${prof.id}&service_id=${svc.id}`}
                      className="group rounded-xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200 dark:bg-gray-900 dark:border-gray-800 dark:hover:border-indigo-800"
                    >
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 group-hover:scale-110 transition-all dark:bg-indigo-900/20 dark:text-indigo-400 dark:group-hover:bg-indigo-900/30">
                        {getIcon(svc.name)}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 truncate">
                        {svc.name}
                      </h3>
                      {svc.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                          {svc.description}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                          <Clock className="h-3.5 w-3.5" />
                          {svc.duration_minutes} min
                        </span>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {formatPrice(Number(svc.price))}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
