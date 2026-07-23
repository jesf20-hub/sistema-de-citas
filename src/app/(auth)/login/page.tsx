"use client";

import Link from "next/link";
import { login } from "@/lib/actions/auth";
import { useActionState } from "react";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-6 sm:p-8 shadow-md dark:bg-gray-900 dark:shadow-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Iniciar sesi&oacute;n
        </h1>
        {state?.error && (
          <div
            className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
            role="alert"
            aria-live="polite"
          >
            {state.error}
          </div>
        )}
        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Correo electr&oacute;nico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contrase&ntilde;a
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {pending ? "Iniciando sesi&oacute;n\u2026" : "Iniciar sesi&oacute;n"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          &iquest;No tienes cuenta?{" "}
          <Link href="/register" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
            Reg&iacute;strate
          </Link>
        </p>
        <p className="mt-2 text-center text-sm">
          <Link href="/reset-password" className="text-gray-500 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400">
            &iquest;Olvidaste tu contrase&ntilde;a?
          </Link>
        </p>
      </div>
    </div>
  );
}
