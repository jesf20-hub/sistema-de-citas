"use client";
import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Appointment } from "@/lib/types";

export function useAppointmentRealtime(professionalId?: string) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const filter = professionalId
      ? `professional_id=eq.${professionalId}`
      : undefined;

    const channel = supabase
      .channel("appointments-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "appointments",
          filter,
        },
        (payload) => {
          const appt = payload.new as Appointment;
          toast(`Nueva cita agendada`, {
            description: `${appt.date} a las ${appt.start_time}`,
            action: {
              label: "Ver",
              onClick: () => (window.location.href = "/profesional"),
            },
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [professionalId]);

  return channelRef;
}
