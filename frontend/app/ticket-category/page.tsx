import TicketCategoryTable from "./components/TicketCategoryTable";

export default function TicketCategoryPage() {
  return (
    <main className="min-h-screen bg-[#f9f6ef] relative overflow-hidden">

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[#ffdb33]/25 -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[280px] h-[280px] rounded-full bg-[#ffdb33]/15 translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-8 pt-12 pb-16">

        {/* HERO HEADER */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            {/* Overline */}
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="block w-6 h-[3px] bg-black" />
              <span className="font-head text-[0.6rem] tracking-[0.2em] uppercase text-black">
                Dashboard
              </span>
            </div>

            <h1 className="font-head text-5xl text-black leading-none tracking-tight">
              Ticket{" "}
              <span className="bg-[#ffdb33] px-1">
                Category
              </span>
            </h1>

            <p className="mt-3 text-gray-500 text-sm">
              Kelola kategori tiket untuk setiap event dalam satu tempat.
            </p>
          </div>

          {/* Stat */}
          <div className="hidden sm:flex flex-col items-end gap-0.5">
            <span className="font-head text-5xl text-black leading-none">🎟</span>
            <span className="font-head text-[0.6rem] tracking-[0.12em] uppercase text-gray-500">
              Categories
            </span>
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_#000] overflow-hidden">
          <div className="h-[5px] bg-[#ffdb33] border-b-2 border-black" />
          <div className="p-8">
            <TicketCategoryTable />
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center font-head text-[0.6rem] tracking-[0.15em] uppercase text-gray-400">
          TikTakTuk
        </p>

      </div>
    </main>
  );
}