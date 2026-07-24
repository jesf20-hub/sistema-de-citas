import { updateProfile } from "@/lib/actions/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await updateProfile(formData);
  return Response.json(result);
}
