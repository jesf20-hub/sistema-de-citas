import { getUser } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { DAYS } from "@/lib/utils";
import { ScheduleForm, DeleteScheduleButton } from "./schedule-buttons";
import type { Schedule } from "@/lib/types";

export default async function HorariosPage() {
  const user = await getUser();
  const supabase = await createClient();

  const { data: schedules } = await supabase
    .from("schedules")
    .select("*")
    .eq("professional_id", user!.id)
    .order("day_of_week")
    .returns<Schedule[]>();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mis Horarios</h1>
        <ScheduleForm />
      </div>

      <div className="grid gap-4">
        {Array.from({ length: 7 }).map((_, day) => {
          const schedule = schedules?.find((s) => s.day_of_week === day);
          return (
            <div
              key={day}
              className="rounded-lg bg-white p-4 shadow-sm border border-gray-100 flex flex-wrap items-center gap-3 justify-between dark:bg-gray-900 dark:border-gray-800 dark:shadow-gray-900"
            >
              <span className="font-medium text-gray-900 w-24 sm:w-32 dark:text-gray-100">
                {DAYS[day]}
              </span>
              {schedule ? (
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 flex-1 justify-end sm:justify-start">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {schedule.start_time} - {schedule.end_time}
                  </span>
                  <ScheduleForm schedule={schedule} />
                  <DeleteScheduleButton id={schedule.id} />
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 flex-1 justify-end sm:justify-start">
                  <span className="text-sm text-gray-400 dark:text-gray-600">Sin horario</span>
                  <ScheduleForm
                    schedule={{ day_of_week: day, start_time: "08:00", end_time: "17:00" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
