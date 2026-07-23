import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Toaster } from "sonner";
import { Providers } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CitasPro - Reserva de servicios",
    template: "%s | CitasPro",
  },
  description:
    "Reserva citas con profesionales de belleza, salud y más. Encuentra estilistas, barberos y masajistas cerca de ti.",
  keywords: ["citas", "reservas", "estilista", "barbero", "belleza", "servicios"],
  authors: [{ name: "CitasPro" }],
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "CitasPro",
    title: "CitasPro - Reserva de servicios",
    description: "Reserva citas con profesionales de belleza, salud y más.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CitasPro",
    description: "Reserva citas con profesionales de belleza, salud y más.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#4f46e5" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="CitasPro" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CitasPro" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-white"
          >
            Saltar al contenido
          </a>
          <Navbar />
          <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
