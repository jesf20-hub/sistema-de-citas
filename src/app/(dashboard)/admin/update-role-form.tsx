"use client";

export function UpdateRoleForm({ userId, currentRole }: { userId: string; currentRole: string }) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await fetch("/api/admin/role", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: formData.get("role") }),
    });
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <select
        name="role"
        defaultValue={currentRole}
        className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      >
        <option value="cliente">Cliente</option>
        <option value="profesional">Profesional</option>
        <option value="admin">Admin</option>
      </select>
      <button
        type="submit"
        className="rounded-md bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700"
      >
        Cambiar
      </button>
    </form>
  );
}
