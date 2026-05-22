import TicketTable from "./components/TicketTable";
import { Ticket, CheckCircle, Clock } from "lucide-react";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export default async function TicketsPage() {
  const session = await getSession();
  const role = session?.role;
  const userId = session?.user_id;

  const canManage = role === "admin" || role === "organizer";

  // Fetch stats for the header cards
  let totalCount = 0;
  let validCount = 0;
  let usedCount = 0;

  try {
    const statsQuery = role === "organizer" 
      ? `SELECT status, count(*) FROM TICKET t 
         JOIN TICKET_CATEGORY tc ON tc.category_id = t.tcategory_id 
         JOIN EVENT e ON e.event_id = tc.tevent_id 
         JOIN ORGANIZER org ON org.organizer_id = e.organizer_id 
         WHERE org.user_id = $1 GROUP BY status`
      : `SELECT status, count(*) FROM TICKET GROUP BY status`;
    
    const params = role === "organizer" ? [userId] : [];
    const statsRes = await query(statsQuery, params);
    
    statsRes.rows.forEach(row => {
      const count = parseInt(row.count);
      totalCount += count;
      if (row.status === 'Valid') validCount += count;
      else if (row.status === 'Used') usedCount += count;
    });
  } catch (err) {
    console.error("Error fetching ticket stats:", err);
  }

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 min-h-full w-full">

      {/* HEADER BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <div className="col-span-1 md:col-span-2 bg-[#ffdb33] p-6 md:p-10 rounded-2xl border-4 border-black shadow-[8px_8px_0_0_#000] relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <Ticket size={200} />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold uppercase border-2 border-black inline-block px-3 py-1 bg-white mb-4">
              Manajemen Tiket
            </h2>
            <h1 className="text-4xl md:text-5xl font-head leading-tight">
              {canManage ? <>Kelola Tiket <br /> Event</> : <>Lihat Tiket <br /> Event</>}
            </h1>
            <p className="mt-2 text-sm">
              {canManage ? "Buat dan kelola tiket untuk setiap pesanan event." : "Lihat daftar tiket yang tersedia."}
            </p>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="col-span-1 bg-black text-white p-6 rounded-2xl border-4 border-black flex flex-col justify-center items-center gap-2 shadow-[4px_4px_0_0_#000]">
          <h3 className="text-4xl font-head text-[#ffdb33]">{totalCount}</h3>
          <p className="text-center font-head text-[0.6rem] tracking-widest uppercase">Total Tiket</p>
        </div>

        <div className="col-span-1 grid grid-cols-1 gap-6">
          <div className="bg-white p-4 rounded-2xl border-4 border-black flex flex-col justify-center items-center gap-1 shadow-[4px_4px_0_0_#000]">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" />
              <h3 className="text-2xl font-head text-black">{validCount}</h3>
            </div>
            <p className="text-center font-head text-[0.6rem] tracking-widest uppercase text-gray-500">Valid</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border-4 border-black flex flex-col justify-center items-center gap-1 shadow-[4px_4px_0_0_#000]">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-blue-500" />
              <h3 className="text-2xl font-head text-black">{usedCount}</h3>
            </div>
            <p className="text-center font-head text-[0.6rem] tracking-widest uppercase text-gray-500">Terpakai</p>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_#000]">
        <div className="p-6 bg-black text-white flex justify-between items-center">
          <h2 className="text-xl font-head">Daftar Tiket</h2>
        </div>

        <div className="p-6 bg-[#f9f6ef]">
          <TicketTable role={role} userId={userId} />
        </div>
      </div>

    </div>
  );
}
