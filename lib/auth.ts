'use server';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "./db";

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

  try {
    // 1. Cari user
    const userResult = await query(
      'SELECT user_id, username FROM USER_ACCOUNT WHERE username = $1 AND password = $2',
      [username, password]
    );

    const user = userResult.rows[0];

    if (!user) {
      return { error: "Username atau password salah!" };
    }

    // 2. Cari Role
    const roleResult = await query(
      `SELECT r.role_name 
       FROM ACCOUNT_ROLE ar 
       JOIN ROLE r ON ar.role_id = r.role_id 
       WHERE ar.user_id = $1`,
      [user.user_id]
    );

    const roleObj = roleResult.rows[0]; // ✅ [0] bukan langsung .rows
    let role = "customer";

    if (roleObj) {
      const name = roleObj.role_name.toLowerCase();
      if (name === "administrator") role = "admin";
      else if (name === "organizer") role = "organizer";
      else role = "customer";
    }

    // 3. Simpan Session
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

  } catch (error: any) {
    console.error("Auth Error:", error);
    if (error.message?.includes('timeout') || error.code === 'ECONNRESET') {
      return { error: "Database sedang bersiap. Tunggu 5 detik lalu klik Login lagi." };
    }
    return { error: "Terjadi kesalahan pada koneksi database." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("tiktaktuk_session");
  redirect("/");
}