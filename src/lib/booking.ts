/**
 * Utilidades puras de fecha/hora para validar citas.
 * Sin dependencias de red ni de Supabase: facilmente testeables.
 */

// Convierte "HH:MM" o "HH:MM:SS" a minutos desde medianoche.
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":");
  return Number(h) * 60 + Number(m);
}

// Dia de la semana (0=Domingo..6=Sabado) para una fecha "YYYY-MM-DD".
export function dayOfWeek(date: string): number {
  return new Date(`${date}T00:00:00`).getDay();
}

// true si la fecha "YYYY-MM-DD" es hoy o posterior (comparando en dia local).
export function isFutureOrToday(date: string, now: Date = new Date()): boolean {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(`${date}T00:00:00`);
  return target.getTime() >= today.getTime();
}

// Duracion en minutos entre dos horas "HH:MM".
export function durationMinutes(start: string, end: string): number {
  return timeToMinutes(end) - timeToMinutes(start);
}

// true si [start,end) cabe dentro del horario [scheduleStart, scheduleEnd].
export function isWithinSchedule(
  start: string,
  end: string,
  scheduleStart: string,
  scheduleEnd: string
): boolean {
  return (
    timeToMinutes(start) >= timeToMinutes(scheduleStart) &&
    timeToMinutes(end) <= timeToMinutes(scheduleEnd)
  );
}
