import { uploadAvatar } from "@/lib/actions/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await uploadAvatar(formData);
  return Response.json(result);
}
