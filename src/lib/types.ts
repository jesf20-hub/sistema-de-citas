export type Appointment = {
  id: string;
  client_id: string;
  professional_id: string;
  service_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: "pendiente" | "confirmada" | "cancelada" | "completada";
  notes?: string;
  created_at: string;
  service?: { name: string; price?: number } | null;
  client?: { full_name: string } | null;
  professional?: { full_name: string; id?: string } | null;
};

export type Service = {
  id: string;
  professional_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  active: boolean;
  created_at: string;
  professional?: { id: string; full_name: string } | null;
};

export type Schedule = {
  id: string;
  professional_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export type Profile = {
  id: string;
  role: string;
  full_name: string;
  phone?: string;
  created_at: string;
};
