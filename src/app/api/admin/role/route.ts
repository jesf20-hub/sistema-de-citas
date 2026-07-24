import { updateUserRole } from "@/lib/actions/admin";

export async function PUT(request: Request) {
  const { userId, role } = await request.json();
  const result = await updateUserRole(userId, role);
  return Response.json(result);
}
