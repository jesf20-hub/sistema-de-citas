import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const checks: Record<string, boolean> = {};
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").select("id", { count: "exact", head: true });
    checks.db = !error;
  } catch {
    checks.db = false;
  }

  const healthy = Object.values(checks).every(Boolean);
  return Response.json(
    { status: healthy ? "healthy" : "degraded", checks, uptime: process.uptime() },
    { status: healthy ? 200 : 503 }
  );
}
