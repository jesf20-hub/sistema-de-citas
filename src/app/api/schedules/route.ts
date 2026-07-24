import { createSchedule, deleteSchedule } from "@/lib/actions/profesional";

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await createSchedule(formData);
  return Response.json(result);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const result = await deleteSchedule(id);
  return Response.json(result);
}
