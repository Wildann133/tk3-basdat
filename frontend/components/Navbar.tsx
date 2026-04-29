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
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Kategori Tiket</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Manajemen Tiket</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Semua Order</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Tiket (Aset)</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Order (Aset)</Link>
          </>
        );
      case "organizer":
        return (
          <>
            <Link href="/dashboard" className="text-sm font-bold hover:text-primary transition-colors">Dashboard</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Event Saya</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Manajemen Venue</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Manajemen Kursi</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Kategori Tiket</Link>
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Manajemen Tiket</Link>
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
            <Link href="#" className="text-sm font-bold hover:text-primary transition-colors">Artis</Link>
          </>
        );
    }
  };

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto border-2 border-black bg-[#fdfdfc] flex items-center justify-between px-4 py-2 w-full max-w-5xl shadow-[4px_4px_0_0_#000] gap-4">
        <div className="flex items-center gap-6">
          <Link href="/">
            <span className="font-head text-2xl font-black text-black hover:text-primary transition-colors cursor-pointer tracking-tighter flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-black bg-yellow-400 relative overflow-hidden flex items-center justify-center shrink-0">
                <div className="w-3 h-3 bg-white rounded-full border border-black absolute top-0.5 left-0.5"></div>
              </div>
              TikTakTuk
            </span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {getRoleMenus()}
        </div>

        <div className="flex items-center space-x-3">
          {!session ? (
            <>
              <Link href="/login">
                <Button variant="ghost" className="bg-white text-black font-bold border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all px-4 py-1.5 h-auto text-sm rounded-none">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="default" className="bg-yellow-400 text-black font-bold border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all px-4 py-1.5 h-auto text-sm rounded-none">
                  Sign up
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/profile">
                <Button variant="ghost" className="bg-white text-black font-bold border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all px-4 py-1.5 h-auto text-sm rounded-none w-[100px]">
                  Profile
                </Button>
              </Link>
              <form action={logoutAction}>
                <Button type="submit" className="bg-red-500 text-white font-bold border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all px-4 py-1.5 h-auto text-sm rounded-none w-[100px]">
                  Logout
                </Button>
              </form>
            </>
          )}
        </div>

        {/* MOBILE MENU TOGGLE PLACEHOLDER */}
        {session && (
          <div className="lg:hidden absolute top-14 left-0 w-full bg-white border-2 border-black p-4 flex flex-col gap-4 shadow-[4px_4px_0_0_#000] hidden">
            {getRoleMenus()}
          </div>
        )}
      </nav>
    </div>
  );
}