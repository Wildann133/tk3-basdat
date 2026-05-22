import { requireDashboardRoles, requireDashboardSession } from "@/lib/dashboard";
import {
  createOrderForCustomer,
  deleteOrderById,
  getOrdersForAdmin,
  getOrdersForCustomer,
  getOrdersForOrganizer,
  updateOrderById,
} from "@/lib/orders";

export const dynamic = "force-dynamic";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function GET() {
  const sessionResult = await requireDashboardRoles(["admin", "organizer", "customer"]);

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  try {
    const orders =
      sessionResult.session.role === "admin"
        ? await getOrdersForAdmin()
        : sessionResult.session.role === "organizer"
          ? await getOrdersForOrganizer(sessionResult.session.user_id)
          : await getOrdersForCustomer(sessionResult.session.user_id);

    return Response.json(orders, { status: 200 });
  } catch (error: unknown) {
    console.error("Error GET Orders:", error);
    return Response.json(
      { error: getErrorMessage(error, "Gagal memuat daftar order") },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const sessionResult = await requireDashboardSession("customer");

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  try {
    const body = await request.json();
    const order = await createOrderForCustomer(sessionResult.session.user_id, {
      event_id: (body.event_id ?? "").trim(),
      ticket_category_id: (body.ticket_category_id ?? "").trim(),
      quantity: Number(body.quantity),
      seats_input: typeof body.seats_input === "string" ? body.seats_input : "",
      promo_code: typeof body.promo_code === "string" ? body.promo_code : "",
    });

    return Response.json(order, { status: 201 });
  } catch (error: unknown) {
    console.error("Error POST Orders:", error);
    return Response.json(
      { error: getErrorMessage(error, "Gagal membuat order") },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  const sessionResult = await requireDashboardSession("admin");

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  try {
    const body = await request.json();
    const id = (body.id ?? body.order_id ?? "").trim();

    if (!id) {
      return Response.json({ error: "ID order wajib disertakan" }, { status: 400 });
    }

    const updatedOrder = await updateOrderById({
      id,
      payment_status: body.payment_status,
      total_amount: body.total_amount,
    });

    if (!updatedOrder) {
      return Response.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }

    return Response.json(updatedOrder, { status: 200 });
  } catch (error: unknown) {
    console.error("Error PUT Orders:", error);
    return Response.json(
      { error: getErrorMessage(error, "Gagal mengupdate order") },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const sessionResult = await requireDashboardSession("admin");

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "ID order wajib disertakan" }, { status: 400 });
    }

    const deletedOrder = await deleteOrderById(id);
    if (!deletedOrder) {
      return Response.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }

    return Response.json({ message: "Order berhasil dihapus" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error DELETE Orders:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23503"
    ) {
      return Response.json(
        { error: getErrorMessage(error, "Gagal menghapus order karena masih memiliki relasi data lain") },
        { status: 409 }
      );
    }

    return Response.json(
      { error: getErrorMessage(error, "Gagal menghapus order") },
      { status: 400 }
    );
  }
}
