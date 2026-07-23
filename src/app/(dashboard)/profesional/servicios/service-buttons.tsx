"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createService, updateService, deleteService } from "@/lib/actions/profesional";
import { useFormDirty } from "@/lib/use-form-dirty";

type Service = {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  active: boolean;
};

export function ServiceForm({ service }: { service?: Service }) {
  const [open, setOpen] = useState(false);
  const isEditing = !!service;
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
        className={`rounded-md px-3 py-1 text-sm ${
          isEditing
            ? "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
      >
        {isEditing ? "Editar" : "Nuevo servicio"}
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
          aria-label={isEditing ? "Editar servicio" : "Nuevo servicio"}
        >
          <div
            ref={dialogRef}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto dark:bg-gray-900 dark:shadow-gray-950"
          >
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {isEditing ? "Editar servicio" : "Nuevo servicio"}
            </h2>
            <form
              action={async (fd: FormData) => {
                if (isEditing) {
                  fd.append("id", service.id);
                }
                const result = isEditing
                  ? await updateService(fd)
                  : await createService(fd);
                if (!result?.error) setOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="svc-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre
                </label>
                <input
                  id="svc-name"
                  name="name"
                  defaultValue={service?.name}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label htmlFor="svc-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descripci&oacute;n
                </label>
                <textarea
                  id="svc-desc"
                  name="description"
                  defaultValue={service?.description || ""}
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="svc-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Duraci&oacute;n (min)
                  </label>
                  <input
                    id="svc-duration"
                    name="duration_minutes"
                    type="number"
                    min={1}
                    defaultValue={service?.duration_minutes || 60}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="svc-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Precio
                  </label>
                  <input
                    id="svc-price"
                    name="price"
                    type="number"
                    step="0.01"
                    min={0}
                    defaultValue={service?.price || 0}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>
              {isEditing && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="active"
                    id="svc-active"
                    value="true"
                    defaultChecked={service.active}
                    className="rounded"
                  />
                  <label htmlFor="svc-active" className="text-sm text-gray-700 dark:text-gray-300">
                    Activo
                  </label>
                </div>
              )}
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
                  {isEditing ? "Guardar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function DeleteServiceButton({ id }: { id: string }) {
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
        className="rounded-md px-3 py-1 text-sm border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
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
          aria-label="Confirmar eliminación de servicio"
        >
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl dark:bg-gray-900 dark:shadow-gray-950">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">¿Eliminar este servicio?</h3>
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
                  await deleteService(id);
                  toast.success("Servicio eliminado");
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
