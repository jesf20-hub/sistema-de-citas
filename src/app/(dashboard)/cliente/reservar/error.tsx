"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Algo sali&oacute; mal</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">Ocurri&oacute; un error al cargar esta p&aacute;gina.</p>
      <button
        onClick={reset}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
