import { createAppointment, updateAppointmentStatus, cancelAppointment } from "@/lib/actions/appointments";

export async function POST(request: Request) {
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "cancel") {
    const result = await cancelAppointment(formData.get("id") as string);
    return Response.json(result);
  }

  const result = await createAppointment(formData);
  return Response.json(result);
}

export async function PUT(request: Request) {
  const formData = await request.formData();
  const result = await updateAppointmentStatus(formData);
  return Response.json(result);
}
