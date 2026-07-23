export const typeDefs = /* GraphQL */ `
  enum Role {
    cliente
    profesional
    admin
  }

  enum AppointmentStatus {
    pendiente
    confirmada
    cancelada
    completada
  }

  type Profile {
    id: ID!
    role: Role!
    full_name: String!
    phone: String
    avatar_url: String
    bio: String
    created_at: String
  }

  type Service {
    id: ID!
    professional_id: ID!
    name: String!
    description: String
    duration_minutes: Int!
    price: Float!
    active: Boolean!
    created_at: String
    professional: Profile
  }

  type Schedule {
    id: ID!
    professional_id: ID!
    day_of_week: Int!
    start_time: String!
    end_time: String!
  }

  type Appointment {
    id: ID!
    client_id: ID!
    professional_id: ID!
    service_id: ID!
    date: String!
    start_time: String!
    end_time: String!
    status: AppointmentStatus!
    notes: String
    created_at: String
    client: Profile
    professional: Profile
    service: Service
  }

  type Query {
    """Perfil del usuario autenticado"""
    me: Profile
    """Buscar profesionales disponibles"""
    professionals(search: String): [Profile]
    """Servicios de un profesional (por defecto solo activos)"""
    services(professionalId: ID, active: Boolean): [Service]
    """Horarios semanales de un profesional"""
    schedules(professionalId: ID!): [Schedule]
    """Citas del usuario autenticado (cliente o profesional)"""
    myAppointments(
      status: AppointmentStatus
      from: String
      to: String
    ): [Appointment]
    """Admin: listar todos los perfiles"""
    allProfiles(role: Role): [Profile]
    """Admin: métricas rápidas"""
    metrics: Metrics
  }

  type Metrics {
    totalClients: Int
    totalProfessionals: Int
    totalServices: Int
    totalAppointments: Int
  }

  type Mutation {
    """Crear una cita como cliente"""
    createAppointment(input: CreateAppointmentInput!): AppointmentPayload
    """Cancelar una cita propia"""
    cancelAppointment(id: ID!): AppointmentPayload
    """Profesional/admin: cambiar estado de una cita"""
    updateAppointmentStatus(id: ID!, status: AppointmentStatus!): AppointmentPayload
  }

  input CreateAppointmentInput {
    professional_id: ID!
    service_id: ID!
    date: String!
    start_time: String!
    end_time: String!
    notes: String
  }

  type AppointmentPayload {
    success: Boolean
    error: String
    appointment: Appointment
  }
`;
