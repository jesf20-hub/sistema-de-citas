"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createSchedule, deleteSchedule } from "@/lib/actions/profesional";
import { DAYS } from "@/lib/utils";
import { useFormDirty } from "@/lib/use-form-dirty";

type Schedule = {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export function ScheduleForm({ schedule }: { schedule?: Schedule }) {
  const [open, setOpen] = useState(false);
  const isEditing = !!schedule?.id;
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useFormDirty(open);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md px-3 py-1 text-xs border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        {isEditing ? "Editar" : "Agregar"}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50"
          style={{ overscrollBehavior: "contain" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label={isEditing ? "Editar horario" : `Agregar horario - ${DAYS[schedule?.day_of_week ?? 0]}`}
        >
          <div
            ref={dialogRef}
            className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 dark:bg-gray-900 dark:shadow-gray-950"
          >
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {isEditing
                ? "Editar horario"
                : `Agregar horario\u2009-\u2009${DAYS[schedule?.day_of_week ?? 0]}`}
            </h2>
            <form
              action={async (fd: FormData) => {
                if (!isEditing) {
                  fd.append("day_of_week", String(schedule!.day_of_week));
                }
                const result = await createSchedule(fd);
                if (!result?.error) setOpen(false);
              }}
              className="space-y-4"
            >
              {isEditing && (
                <input type="hidden" name="id" value={schedule!.id} />
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sch-start" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hora inicio
                  </label>
                  <input
                    id="sch-start"
                    name="start_time"
                    type="time"
                    defaultValue={schedule?.start_time || "08:00"}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="sch-end" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hora fin
                  </label>
                  <input
                    id="sch-end"
                    name="end_time"
                    type="time"
                    defaultValue={schedule?.end_time || "17:00"}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {isEditing ? "Guardar" : "Agregar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function DeleteScheduleButton({ id }: { id: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

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
        type="button"
        onClick={() => setShowConfirm(true)}
        className="rounded-md px-3 py-1 text-xs border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        Eliminar
      </button>

      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50"
          style={{ overscrollBehavior: "contain" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConfirm(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar eliminación de horario"
        >
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl dark:bg-gray-900 dark:shadow-gray-950">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">¿Eliminar este horario?</h3>
            <p className="text-sm text-gray-600 mb-4 dark:text-gray-400">Esta acción no se puede deshacer.</p>
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
                  await deleteSchedule(id);
                  toast.success("Horario eliminado");
                  setShowConfirm(false);
                  setLoading(false);
                }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Eliminando…" : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
