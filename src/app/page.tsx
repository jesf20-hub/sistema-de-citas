import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-2">
      <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Reserva tu cita en minutos
      </h1>
      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl mb-10">
        Encuentra profesionales de confianza y agenda tus servicios de belleza,
        salud y más. Fácil, rápido y sin complicaciones.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link
          href="/register"
          className="rounded-lg bg-indigo-600 px-6 py-3 text-white font-medium hover:bg-indigo-700"
        >
          Crear cuenta gratis
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Iniciar sesión
        </Link>
      </div>
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl">
        {[
          {
            title: "Elige tu servicio",
            desc: "Explora servicios de estilistas, barberos, masajistas y más.",
          },
          {
            title: "Selecciona fecha y hora",
            desc: "Elige el horario que mejor se adapte a tu disponibilidad.",
          },
          {
            title: "Confirma y listo",
            desc: "Recibe la confirmación y asiste a tu cita sin filas.",
          },
        ].map((item) => (
          <div key={item.title} className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
