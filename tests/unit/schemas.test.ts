import { describe, it, expect } from "vitest";
import {
  signupSchema,
  loginSchema,
  serviceSchema,
  serviceUpdateSchema,
  scheduleSchema,
  appointmentSchema,
  appointmentStatusSchema,
  profileUpdateSchema,
  roleUpdateSchema,
} from "@/lib/schemas";

const UUID = "123e4567-e89b-12d3-a456-426614174000";

describe("signupSchema", () => {
  const valid = {
    email: "user@example.com",
    password: "supersecret",
    full_name: "Ada Lovelace",
    role: "cliente",
  };

  it("acepta datos validos", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("recorta espacios en email y nombre", () => {
    const parsed = signupSchema.parse({ ...valid, email: "  a@b.com ", full_name: "  Ada  " });
    expect(parsed.email).toBe("a@b.com");
    expect(parsed.full_name).toBe("Ada");
  });

  it("rechaza email invalido", () => {
    expect(signupSchema.safeParse({ ...valid, email: "no-es-email" }).success).toBe(false);
  });

  it("rechaza password menor a 8 caracteres", () => {
    expect(signupSchema.safeParse({ ...valid, password: "1234567" }).success).toBe(false);
  });

  it("rechaza nombre menor a 2 caracteres", () => {
    expect(signupSchema.safeParse({ ...valid, full_name: "A" }).success).toBe(false);
  });

  it("rechaza rol no permitido (anti escalacion de privilegios)", () => {
    expect(signupSchema.safeParse({ ...valid, role: "admin" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...valid, role: "root" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("acepta credenciales validas", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });

  it("rechaza password vacio", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });

  it("rechaza email invalido", () => {
    expect(loginSchema.safeParse({ email: "bad", password: "x" }).success).toBe(false);
  });
});

describe("serviceSchema", () => {
  const valid = { name: "Corte", duration_minutes: 30, price: 20000 };

  it("acepta un servicio valido", () => {
    expect(serviceSchema.safeParse(valid).success).toBe(true);
  });

  it("coacciona strings numericos (FormData)", () => {
    const parsed = serviceSchema.parse({ name: "Corte", duration_minutes: "45", price: "15000" });
    expect(parsed.duration_minutes).toBe(45);
    expect(parsed.price).toBe(15000);
  });

  it("rechaza duracion menor a 5 minutos", () => {
    expect(serviceSchema.safeParse({ ...valid, duration_minutes: 4 }).success).toBe(false);
  });

  it("rechaza duracion mayor a 480 minutos", () => {
    expect(serviceSchema.safeParse({ ...valid, duration_minutes: 481 }).success).toBe(false);
  });

  it("rechaza precio negativo", () => {
    expect(serviceSchema.safeParse({ ...valid, price: -1 }).success).toBe(false);
  });

  it("rechaza nombre vacio", () => {
    expect(serviceSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });
});

describe("serviceUpdateSchema", () => {
  it("requiere un id uuid", () => {
    const base = { name: "Corte", duration_minutes: 30, price: 20000 };
    expect(serviceUpdateSchema.safeParse({ ...base, id: UUID }).success).toBe(true);
    expect(serviceUpdateSchema.safeParse({ ...base, id: "abc" }).success).toBe(false);
  });
});

describe("scheduleSchema", () => {
  const valid = { day_of_week: 1, start_time: "09:00", end_time: "17:00" };

  it("acepta un horario valido", () => {
    expect(scheduleSchema.safeParse(valid).success).toBe(true);
  });

  it("rechaza formato de hora invalido", () => {
    expect(scheduleSchema.safeParse({ ...valid, start_time: "9:00" }).success).toBe(false);
    expect(scheduleSchema.safeParse({ ...valid, end_time: "25:99x" }).success).toBe(false);
  });

  it("rechaza day_of_week fuera de rango", () => {
    expect(scheduleSchema.safeParse({ ...valid, day_of_week: 7 }).success).toBe(false);
    expect(scheduleSchema.safeParse({ ...valid, day_of_week: -1 }).success).toBe(false);
  });
});

describe("appointmentSchema", () => {
  const valid = {
    professional_id: UUID,
    service_id: UUID,
    date: "2026-01-15",
    start_time: "10:00",
    end_time: "11:00",
  };

  it("acepta una cita valida", () => {
    expect(appointmentSchema.safeParse(valid).success).toBe(true);
  });

  it("rechaza ids no uuid", () => {
    expect(appointmentSchema.safeParse({ ...valid, professional_id: "1" }).success).toBe(false);
  });

  it("rechaza formato de fecha invalido", () => {
    expect(appointmentSchema.safeParse({ ...valid, date: "15/01/2026" }).success).toBe(false);
  });

  it("rechaza notas de mas de 500 caracteres", () => {
    const notes = "x".repeat(501);
    expect(appointmentSchema.safeParse({ ...valid, notes }).success).toBe(false);
  });

  it("acepta notas dentro del limite", () => {
    expect(appointmentSchema.safeParse({ ...valid, notes: "x".repeat(500) }).success).toBe(true);
  });
});

describe("appointmentStatusSchema", () => {
  it("acepta estados validos", () => {
    for (const status of ["pendiente", "confirmada", "cancelada", "completada"]) {
      expect(appointmentStatusSchema.safeParse({ id: UUID, status }).success).toBe(true);
    }
  });

  it("rechaza estados invalidos", () => {
    expect(appointmentStatusSchema.safeParse({ id: UUID, status: "borrada" }).success).toBe(false);
  });
});

describe("profileUpdateSchema", () => {
  it("acepta perfil valido con campos opcionales ausentes", () => {
    expect(profileUpdateSchema.safeParse({ full_name: "Ada" }).success).toBe(true);
  });

  it("rechaza nombre menor a 2 caracteres", () => {
    expect(profileUpdateSchema.safeParse({ full_name: "A" }).success).toBe(false);
  });

  it("rechaza bio de mas de 500 caracteres", () => {
    expect(profileUpdateSchema.safeParse({ full_name: "Ada", bio: "x".repeat(501) }).success).toBe(false);
  });

  it("acepta un telefono valido", () => {
    expect(profileUpdateSchema.safeParse({ full_name: "Ada", phone: "+57 300 123 4567" }).success).toBe(true);
  });

  it("acepta telefono vacio", () => {
    expect(profileUpdateSchema.safeParse({ full_name: "Ada", phone: "" }).success).toBe(true);
  });

  it("rechaza un telefono con letras", () => {
    expect(profileUpdateSchema.safeParse({ full_name: "Ada", phone: "abc123" }).success).toBe(false);
  });
});

describe("roleUpdateSchema", () => {
  it("acepta roles validos incluyendo admin (solo usable por admin server-side)", () => {
    for (const role of ["cliente", "profesional", "admin"]) {
      expect(roleUpdateSchema.safeParse({ userId: UUID, role }).success).toBe(true);
    }
  });

  it("rechaza rol desconocido", () => {
    expect(roleUpdateSchema.safeParse({ userId: UUID, role: "superadmin" }).success).toBe(false);
  });

  it("rechaza userId no uuid", () => {
    expect(roleUpdateSchema.safeParse({ userId: "x", role: "cliente" }).success).toBe(false);
  });
});
