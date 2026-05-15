import TicketTable from "./components/TicketTable";
import { Ticket } from "lucide-react";
import { getSession } from "@/lib/auth";

export default async function TicketsPage() {
  const session = await getSession();
  const role = session?.role;

  const canManage = role === "admin" || role === "organizer";

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 min-h-full w-full">

      {/* HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="col-span-1 md:col-span-2 bg-[#ffdb33] p-6 md:p-10 rounded-2xl border-4 border-black shadow-[8px_8px_0_0_#000] relative overflow-hidden">
          
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <Ticket size={250} />
          </div>

          <div className="relative z-10">
            <h2 className="text-xl font-bold uppercase border-2 border-black inline-block px-3 py-1 bg-white mb-4">
              Manajemen Tiket
            </h2>

            <h1 className="text-4xl md:text-6xl font-head">
              {canManage ? (
                <>Kelola Tiket <br /> Event</>
              ) : (
                <>Lihat Tiket <br /> Event</>
              )}
            </h1>

            <p className="mt-2">
              {canManage
                ? "Buat dan kelola tiket untuk setiap pesanan event."
                : "Lihat daftar tiket yang tersedia."}
            </p>
          </div>
        </div>

        <div className="col-span-1 bg-black text-white p-6 rounded-2xl border-4 border-black flex flex-col justify-center items-center gap-2">
          <h3 className="text-6xl text-[#ffdb33]">🎫</h3>
          <p className="text-center font-head text-sm tracking-widest uppercase">Total Tiket</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border-4 border-black">
        <div className="p-6 bg-black text-white">
          <h2 className="text-xl font-head">Daftar Tiket</h2>
        </div>

        <div className="p-6 bg-[#f9f6ef]">
          <TicketTable role={role} userId={session?.userId} />
        </div>
      </div>

    </div>
  );
}
