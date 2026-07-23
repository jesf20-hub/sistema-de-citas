"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { cancelAppointment } from "@/lib/actions/appointments";

export function CancelButton({ id }: { id: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showConfirm) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [showConfirm]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && showConfirm) setShowConfirm(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showConfirm]);

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-sm text-red-600 hover:text-red-800"
      >
        Cancelar cita
      </button>

      {showConfirm && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
          style={{ overscrollBehavior: "contain" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConfirm(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar cancelación de cita"
        >
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl dark:bg-gray-900 dark:shadow-gray-950">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">¿Cancelar esta cita?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                No, mantener
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  await cancelAppointment(id);
                  toast.success("Cita cancelada");
                  setShowConfirm(false);
                  setLoading(false);
                }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Cancelando…" : "Sí, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
