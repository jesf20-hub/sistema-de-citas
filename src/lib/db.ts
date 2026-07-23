import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type UserProfile = {
  id: string;
  email: string | undefined;
  role: string;
  full_name: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
};

export const verifySession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return { userId: user.id, email: user.email };
});

export const getUser = cache(async (): Promise<UserProfile | null> => {
  const session = await verifySession();
  if (!session) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone, bio, avatar_url")
    .eq("id", session.userId)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    email: session.email,
    role: profile.role,
    full_name: profile.full_name,
    phone: profile.phone,
    bio: profile.bio,
    avatar_url: profile.avatar_url,
  };
});

export const getUserOrNull = cache(async (): Promise<UserProfile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone, bio, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    email: user.email,
    role: profile.role,
    full_name: profile.full_name,
    phone: profile.phone,
    bio: profile.bio,
    avatar_url: profile.avatar_url,
  };
});

export const requireRole = cache(async (role: string) => {
  const user = await getUser();
  if (!user || user.role !== role) {
    redirect("/login");
  }
  return user;
});
