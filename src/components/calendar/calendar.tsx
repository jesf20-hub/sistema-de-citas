"use client";
import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { Appointment } from "@/lib/types";
import { getStatusColor } from "@/lib/utils";

type CalendarProps = {
  appointments: Appointment[];
  onDateClick?: (date: Date) => void;
  view: "cliente" | "profesional";
};

export function Calendar({ appointments, onDateClick, view }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = useMemo(() => {
    const result: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      result.push(day);
      day = addDays(day, 1);
    }
    return result;
  }, [calendarStart, calendarEnd]);

  function getAppointmentsForDate(date: Date) {
    return appointments.filter((a) => {
      return isSameDay(parseISO(a.date + "T00:00:00"), date);
    });
  }

  return (
    <div className="rounded-lg bg-white shadow-sm border border-gray-100 p-2 sm:p-4 dark:bg-gray-900 dark:border-gray-800 dark:shadow-gray-900">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(addDays(monthStart, -30))} className="p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-800 dark:text-gray-200" aria-label="Mes anterior">&larr;</button>
        <h2 className="text-lg font-semibold capitalize text-gray-900 dark:text-gray-100">{format(currentMonth, "MMMM yyyy", { locale: es })}</h2>
        <button onClick={() => setCurrentMonth(addDays(monthEnd, 1))} className="p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-800 dark:text-gray-200" aria-label="Mes siguiente">&rarr;</button>
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden dark:bg-gray-800">
        {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((d) => (
          <div key={d} className="bg-gray-50 p-2 text-center text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">{d}</div>
        ))}
        {days.map((day) => {
          const dayAppts = getAppointmentsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDateClick?.(day)}
              className={`min-h-[60px] sm:min-h-[80px] bg-white p-1 text-left dark:bg-gray-900 ${
                !isCurrentMonth ? "opacity-30" : ""
              } ${isToday ? "ring-2 ring-indigo-400" : ""} hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors`}
            >
              <span className={`text-xs font-medium ${isToday ? "text-indigo-600 dark:text-indigo-400" : "text-gray-600 dark:text-gray-400"}`}>
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayAppts.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className={`hidden sm:block text-[10px] px-1 py-0.5 rounded truncate ${getStatusColor(a.status)}`}
                  >
                    {a.start_time} {view === "profesional" ? a.client?.full_name?.split(" ")[0] : a.service?.name}
                  </div>
                ))}
                <div className="flex flex-wrap gap-0.5 sm:hidden">
                  {dayAppts.slice(0, 3).map((a) => (
                    <span
                      key={a.id}
                      className={`inline-block h-1.5 w-1.5 rounded-full ${getStatusColor(a.status)}`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                {dayAppts.length > 3 && (
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 px-1">+{dayAppts.length - 3} más</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
