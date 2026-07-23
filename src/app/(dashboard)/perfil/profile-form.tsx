"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { useFormDirty } from "@/lib/use-form-dirty";
import { updateProfile, uploadAvatar } from "@/lib/actions/auth";

type UserProfile = {
  id: string;
  email: string | undefined;
  role: string;
  full_name: string;
};

type Props = {
  user: UserProfile;
  phone: string;
  bio: string;
  avatarUrl: string;
};

export function ProfileForm({ user, phone: initialPhone, bio: initialBio, avatarUrl: initialAvatar }: Props) {
  const [name, setName] = useState(user.full_name);
  const [phone, setPhone] = useState(initialPhone);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dirty =
    name !== user.full_name ||
    phone !== initialPhone ||
    bio !== initialBio;

  useFormDirty(dirty);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const fd = new FormData();
    fd.append("avatar", file);

    const result = await uploadAvatar(fd);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Foto actualizada");
      setAvatarUrl(result.url || "");
    }

    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    fd.append("full_name", name);
    fd.append("phone", phone);
    fd.append("bio", bio);

    const result = await updateProfile(fd);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Perfil actualizado");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-3 dark:bg-gray-800">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-2xl font-bold">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50 dark:text-indigo-400"
        >
          Cambiar foto
        </button>
      </div>

      <div>
        <label htmlFor="pf-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nombre completo
        </label>
        <input
          id="pf-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      <div>
        <label htmlFor="pf-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Teléfono
        </label>
        <input
          id="pf-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      <div>
        <label htmlFor="pf-bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Bio
        </label>
        <textarea
          id="pf-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !dirty}
        className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
