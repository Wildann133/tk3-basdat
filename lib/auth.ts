'use server';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getClient, query } from "./db";
import { randomUUID } from "crypto";

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

export async function registerAction(
  formData: FormData,
  role: "customer" | "organizer" | "admin"
) {
  const username = (formData.get("username") as string)?.trim();
  const password = (formData.get("password") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";
  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();

  if (!username || !password || !confirmPassword) {
    return { error: "Semua field wajib diisi." };
  }

  if (password !== confirmPassword) {
    return { error: "Password dan konfirmasi tidak sama." };
  }

  if (role === "customer" && !fullName) {
    return { error: "Nama lengkap wajib diisi." };
  }

  if (role === "organizer" && (!fullName || !email)) {
    return { error: "Nama dan email organizer wajib diisi." };
  }

  const roleName = role === "admin" ? "administrator" : role;
  const client = await getClient();

  try {
    await client.query("BEGIN");

    const userId = randomUUID();
    await client.query(
      "INSERT INTO USER_ACCOUNT (user_id, username, password) VALUES ($1, $2, $3)",
      [userId, username, password]
    );

    const roleResult = await client.query(
      "SELECT role_id FROM ROLE WHERE LOWER(role_name) = LOWER($1)",
      [roleName]
    );

    if (roleResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { error: "Role tidak ditemukan di database." };
    }

    await client.query(
      "INSERT INTO ACCOUNT_ROLE (role_id, user_id) VALUES ($1, $2)",
      [roleResult.rows[0].role_id, userId]
    );

    if (role === "customer") {
      await client.query(
        "INSERT INTO CUSTOMER (customer_id, full_name, phone_number, user_id) VALUES ($1, $2, $3, $4)",
        [randomUUID(), fullName, phone || null, userId]
      );
    }

    if (role === "organizer") {
      await client.query(
        "INSERT INTO ORGANIZER (organizer_id, organizer_name, contact_email, user_id) VALUES ($1, $2, $3, $4)",
        [randomUUID(), fullName, email, userId]
      );
    }

    await client.query("COMMIT");
    return { success: true };
  } catch (error: unknown) {
    await client.query("ROLLBACK");
    console.error("Register Error:", error);
    if (error instanceof Error && error.message.trim()) {
      return { error: error.message };
    }
    return { error: "Gagal membuat akun. Coba lagi." };
  } finally {
    client.release();
  }
}
