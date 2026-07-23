"use client";
import { useAppointmentRealtime } from "@/lib/realtime";

export function RealtimeWrapper({
  professionalId,
  children,
}: {
  professionalId: string;
  children: React.ReactNode;
}) {
  useAppointmentRealtime(professionalId);
  return <>{children}</>;
}
