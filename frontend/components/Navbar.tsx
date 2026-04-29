import Link from "next/link";
import { Button } from "./retroui/Button";
import { getSession, logoutAction } from "@/lib/auth";

export default async function Navbar() {
  const session = await getSession();

  const getRoleMenus = () => {
    if (!session) return null;

    switch (session.role) {
      case "admin":
        return (
          <>
            <Link href="/dashboard" className="text-sm font-bold hover:text-primary transition-colors">Dashboard</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Manajemen Venue</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Manajemen Kursi</Link>
            <Link href="/ticket-category" className="text-sm font-bold hover:text-primary transition-colors">Manajemen Kategori Tiket</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Manajemen Tiket</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Semua Order</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Tiket (Aset)</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Order (Aset)</Link>
            <Link href="/artists" className="text-sm font-bold hover:text-primary transition-colors">Manajemen Artis</Link>
          </>
        );

      case "organizer":
        return (
          <>
            <Link href="/dashboard" className="text-sm font-bold hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/my-events" className="text-sm font-bold hover:text-primary transition-colors">Event Saya</Link>
            <Link href="/manage-venue" className="text-sm font-bold hover:text-primary transition-colors">Manajemen Venue</Link>
            <Link href="/manage-seats" className="text-sm font-bold hover:text-primary transition-colors">Manajemen Kursi</Link>
            <Link href="/ticket-category" className="text-sm font-bold hover:text-primary transition-colors">Manajemen Kategori Tiket</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Manajemen Tiket</Link>
            <Link href="/artists" className="text-sm font-bold hover:text-primary transition-colors"> Artis</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Semua Order</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Tiket (Aset)</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Order (Aset)</Link>
          </>
        );

      case "customer":
      default:
        return (
          <>
            <Link href="/dashboard" className="text-sm font-bold hover:text-primary transition-colors">Dashboard</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Tiket Saya</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Pesanan</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Cari Event</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Promosi</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Venue</Link>
            <Link href="/ticket-category" className="text-sm font-bold hover:text-primary transition-colors"> Kategori Tiket</Link>
            <Link href="/artists" className="text-sm font-bold hover:text-primary transition-colors">Artis</Link>
          </>
        );
    }
  };

  return (
    <nav className="border-b-4 border-black bg-white flex flex-col md:flex-row items-center justify-between px-6 py-4 mx-4 md:mx-8 mb-8 mt-4 rounded-xl shadow-[6px_6px_0_0_#000] gap-4">
      
      <div className="flex items-center gap-6 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
        <Link href="/">
          <span className="font-head text-3xl font-black text-black hover:text-primary transition-colors cursor-pointer tracking-tighter">
            TikTakTuk
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-4">
          {getRoleMenus()}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {!session ? (
          <>
            <Link href="/login">
              <Button variant="ghost" className="font-bold border-2 border-transparent">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="default" className="font-bold uppercase tracking-wide border-2 border-black shadow-[2px_2px_0_0_#000]">
                Sign up
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link href="/profile">
              <Button variant="ghost" className="font-bold uppercase tracking-widest text-xs border-2 border-black hover:bg-primary">
                Profile ({session.role})
              </Button>
            </Link>

            <form action={logoutAction}>
              <Button
                type="submit"
                className="font-bold uppercase tracking-wide bg-red-500 hover:bg-red-600 text-white border-2 border-black shadow-[2px_2px_0_0_#000]"
              >
                Logout
              </Button>
            </form>
          </>
        )}
      </div>

      {/* MOBILE */}
      {session && (
        <div className="lg:hidden w-full flex overflow-x-auto gap-4 pb-2">
          {getRoleMenus()}
        </div>
      )}
    </nav>
  );
}