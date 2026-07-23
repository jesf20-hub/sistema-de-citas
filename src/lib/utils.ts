export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":");
  return `${h}:${m}`;
}

export function formatDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const DAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export function getStatusColor(status: string): string {
  switch (status) {
    case "pendiente":
      return "bg-yellow-100 text-yellow-800";
    case "confirmada":
      return "bg-green-100 text-green-800";
    case "cancelada":
      return "bg-red-100 text-red-800";
    case "completada":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
