import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().trim().email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  full_name: z.string().trim().min(2, "Mínimo 2 caracteres"),
  role: z.enum(["cliente", "profesional"]),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Correo inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export const serviceSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  duration_minutes: z.coerce.number().int().min(5, "Mínimo 5 minutos").max(480),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
});

export const serviceUpdateSchema = serviceSchema.extend({
  id: z.string().uuid(),
  active: z.coerce.boolean().optional(),
});

export const scheduleSchema = z.object({
  day_of_week: z.coerce.number().int().min(0).max(6).optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
});

export const appointmentSchema = z.object({
  professional_id: z.string().uuid(),
  service_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().max(500).optional(),
});

export const appointmentStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pendiente", "confirmada", "cancelada", "completada"]),
});

export const profileUpdateSchema = z.object({
  full_name: z.string().trim().min(2, "Mínimo 2 caracteres"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s()-]{7,20}$/, "Teléfono inválido")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(500).optional(),
});

export const roleUpdateSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["cliente", "profesional", "admin"]),
});
