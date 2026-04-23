import TicketCategoryTable from "./components/TicketCategoryTable";

export default function TicketCategoryPage() {
  return (
    <main className="min-h-screen bg-[#FFF8F3] relative overflow-hidden">

      {/* Decorative geometric background — */}
      <div className="absolute top-0 right-0 w-[520px] h-[520px] rounded-full bg-orange-100/60 -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[360px] h-[360px] rounded-full bg-amber-100/40 translate-y-1/2 -translate-x-1/4 pointer-events-none" />
      <div className="absolute top-32 right-[480px] w-4 h-4 rounded-full bg-orange-400 pointer-events-none" />
      <div className="absolute top-20 right-[320px] w-2 h-2 rounded-full bg-amber-400 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-8 pt-12 pb-16">

        {/* HERO HEADER */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            {/* Overline tag */}
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="block w-6 h-[3px] bg-orange-500 rounded-full" />
              <span className="text-xs font-semibold tracking-[0.2em] text-orange-500 uppercase">
                Dashboard
              </span>
            </div>

            <h1
              className="text-5xl font-black text-gray-900 leading-none tracking-tight"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Ticket
              <span className="text-orange-500 relative">
                {" "}Category
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-orange-300 rounded-full block" />
              </span>
            </h1>

            <p className="mt-3 text-gray-500 text-base font-normal">
              Kelola kategori tiket untuk setiap event dalam satu tempat.
            </p>
          </div>

          {/* Stats pill */}
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="text-4xl font-black text-orange-500 leading-none">🎟</span>
            <span className="text-xs text-gray-400 tracking-wide uppercase font-medium">Categories</span>
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-3xl shadow-[0_8px_48px_-12px_rgba(234,88,12,0.18)] border border-orange-100 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-300" />
          <div className="p-8">
            <TicketCategoryTable />
          </div>
        </div>

        {/* Footer hint */}
        <p className="mt-6 text-center text-xs text-gray-400 tracking-wide">
            TikTakTuk
        </p>

      </div>
    </main>
  );
}