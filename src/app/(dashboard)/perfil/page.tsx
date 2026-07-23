import { getUser } from "@/lib/db";
import { ProfileForm } from "./profile-form";

export default async function PerfilPage() {
  const user = await getUser();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-gray-100">Editar perfil</h1>
      <ProfileForm
        user={user!}
        phone={user!.phone || ""}
        bio={user!.bio || ""}
        avatarUrl={user!.avatar_url || ""}
      />
    </div>
  );
}
