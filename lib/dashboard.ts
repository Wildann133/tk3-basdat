import { getSession } from "@/lib/auth";

export type DashboardRole = "admin" | "organizer" | "customer";

export type DashboardSession = {
  user_id: string;
  username: string;
  role: DashboardRole;
};

export async function requireDashboardSession(expectedRole: DashboardRole) {
  const session = (await getSession()) as DashboardSession | null;

  if (!session) {
    return { ok: false as const, response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (session.role !== expectedRole) {
    return { ok: false as const, response: Response.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true as const, session };
}

export async function requireDashboardRoles(allowedRoles: DashboardRole[]) {
  const session = (await getSession()) as DashboardSession | null;

  if (!session) {
    return { ok: false as const, response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (!allowedRoles.includes(session.role)) {
    return { ok: false as const, response: Response.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true as const, session };
}

export async function fetchDashboardData<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    let message = "Gagal memuat data dashboard.";

    try {
      const payload = (await response.json()) as { error?: string };
      if (payload?.error) {
        message = payload.error;
      }
    } catch {
      // Ignore JSON parse errors and fall back to the default message.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}