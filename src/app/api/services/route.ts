import { createService, updateService, deleteService } from "@/lib/actions/profesional";

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await createService(formData);
  return Response.json(result);
}

export async function PUT(request: Request) {
  const formData = await request.formData();
  const result = await updateService(formData);
  return Response.json(result);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const result = await deleteService(id);
  return Response.json(result);
}
