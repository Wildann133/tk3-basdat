'use server';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { USERS, ACCOUNT_ROLES, ROLES } from "./dummyData";

// Define dummy USERS locally since we need it for auth, if it's not exported in dummyData we can mock it here
export async function getSession() {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("tiktaktuk_session")?.value;
  
  if (!sessionData) return null;
  try {
    return JSON.parse(sessionData);
  } catch (e) {
    return null;
  }
}

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Semua form wajib diisi." };
  }

  // 1. Cek kecocokan kredensial dengan array USERS di dummy data
  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) {
    return { error: "Username atau password salah!" };
  }

  // 2. Cari Role dari user tersebut melalui tabel relasi
  const accountRole = ACCOUNT_ROLES.find(ar => ar.user_id === user.user_id);
  const roleObj = ROLES.find(r => r.role_id === accountRole?.role_id);
  
  // Ambil role_name (Administrator, Organizer, Customer) lalu kecilkan semua hurufnya
  let role = "customer";

if (roleObj) {
  const name = roleObj.role_name.toLowerCase();

  if (name === "administrator") role = "admin";
  else if (name === "organizer") role = "organizer";
  else role = "customer";
}

  // Set the session payload into a cookie
  const payload = {
    user_id: user.user_id,
    username: user.username,
    role,
    loggedInAt: new Date().toISOString()
  };

  const cookieStore = await cookies();
  cookieStore.set("tiktaktuk_session", JSON.stringify(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/"
  });

  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("tiktaktuk_session");
  redirect("/");
}
