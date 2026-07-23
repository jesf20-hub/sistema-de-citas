"use client";
import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Appointment } from "@/lib/types";

export function RealtimeWrapper({
  clientId,
  children,
}: {
  clientId: string;
  children: React.ReactNode;
}) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("cliente-appointments")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "appointments",
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          const appt = payload.new as Appointment;
          const old = payload.old as Appointment;
          if (appt.status !== old.status) {
            const statusMessages: Record<string, string> = {
              confirmada: "Tu cita fue confirmada",
              cancelada: "Tu cita fue cancelada",
              completada: "Tu cita fue completada",
            };
            const msg = statusMessages[appt.status];
            if (msg) toast(msg);
            window.location.reload();
          }
        }
      )
      .subscribe();
    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  return <>{children}</>;
}
