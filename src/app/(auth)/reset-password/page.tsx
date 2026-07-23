"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password/update`,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-6 sm:p-8 shadow-md dark:bg-gray-900 dark:shadow-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Recuperar contrase&ntilde;a
        </h1>

        {error && (
          <div
            className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        {sent ? (
          <div>
            <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
              Si el correo existe, recibir&aacute;s un enlace para restablecer
              tu contrase&ntilde;a.
            </div>
            <Link
              href="/login"
              className="block text-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
            >
              Volver a iniciar sesi&oacute;n
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Correo electr&oacute;nico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Enviando\u2026" : "Enviar enlace"}
            </button>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              <Link
                href="/login"
                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
              >
                Volver a iniciar sesi&oacute;n
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
