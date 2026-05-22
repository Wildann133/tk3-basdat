import Link from "next/link";
import { Button } from "./retroui/Button";
import { getSession, logoutAction } from "@/lib/auth";
import NavbarDropdown from "./NavbarDropdown";

export default async function Navbar() {
  const session = await getSession();

  const getRoleMenus = (isMobile = false) => {
    if (!session) return null;

    let menus: { href: string; label: string }[] = [];

    switch (session.role) {
      case "admin":
        menus = [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/events", label: "Cari Event" },
          { href: "/myevents", label: "Event Saya" },
          { href: "/venues", label: "Manajemen Venue" },
          { href: "/seats", label: "Manajemen Kursi" },
          { href: "/ticket-category", label: "Manajemen Kategori Tiket" },
          { href: "/artists", label: "Manajemen Artist" },
          { href: "/tickets", label: "Manajemen Tiket" },
          { href: "/promotions", label: "Promosi" },
          { href: "/orders", label: "Semua Order" },
          { href: "/my-tickets", label: "Tiket (Aset)" },
          { href: "/orders", label: "Order (Aset)" },
        ];
        break;
      case "organizer":
        menus = [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/myevents", label: "Event Saya" },
          { href: "/venues", label: "Manajemen Venue" },
          { href: "/seats", label: "Manajemen Kursi" },
          { href: "/ticket-category", label: "Manajemen Kategori Tiket" },
          { href: "/artists", label: "Artist" },
          { href: "/tickets", label: "Manajemen Tiket" },
          { href: "/orders", label: "Semua Order" },
          { href: "/my-tickets", label: "Tiket (Aset)" },
          { href: "/orders", label: "Order (Aset)" },
        ];
        break;
      case "customer":
      default:
        menus = [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/my-tickets", label: "Tiket Saya" },
          { href: "/orders", label: "Pesanan" },
          { href: "/events", label: "Cari Event" },
          { href: "/ticket-category", label: "Kategori Tiket" },
          { href: "/seats", label: "Daftar Kursi" },
          { href: "/artists", label: "Artist" },
          { href: "/promotions", label: "Promosi" },
          { href: "/venues", label: "Venue" },
        ];
        break;
    }

    if (isMobile) {
      return menus.map((menu, index) => (
        <Link key={index} href={menu.href} className="text-sm font-bold hover:text-primary transition-colors">
          {menu.label}
        </Link>
      ));
    }

    const LIMIT = 4;
    const hasHidden = menus.length > LIMIT;
    const visibleMenus = hasHidden ? menus.slice(0, LIMIT - 1) : menus;
    const hiddenMenus = hasHidden ? menus.slice(LIMIT - 1) : [];

    return (
      <>
        {visibleMenus.map((menu, index) => (
          <Link key={index} href={menu.href} className="text-sm font-bold hover:text-primary transition-colors">
            {menu.label}
          </Link>
        ))}
        {hasHidden && <NavbarDropdown items={hiddenMenus} />}
      </>
    );
  };

  return (
    <header className="fixed top-0 z-50 w-full pointer-events-none">
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8 py-3 pointer-events-auto">
      <nav className="border-2 border-black bg-[#fdfdfc] flex items-center justify-between px-4 py-2 w-full shadow-[4px_4px_0_0_#000] gap-4">
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

<div className="flex items-center space-x-4">
  {!session ? (
    <>
      <Link href="/promotions">
        <Button
          variant="ghost"
          className="bg-white text-black font-bold border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all px-4 py-1.5 h-auto text-sm rounded-none"
        >
          Promosi
        </Button>
      </Link>

      <Link href="/login">
        <Button
          variant="ghost"
          className="bg-white text-black font-bold border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all px-4 py-1.5 h-auto text-sm rounded-none"
        >
          Log in
        </Button>
      </Link>

      <Link href="/register">
        <Button
          variant="default"
          className="bg-yellow-400 text-black font-bold border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all px-4 py-1.5 h-auto text-sm rounded-none"
        >
          Sign up
        </Button>
      </Link>
    </>
  ) : (
    <>
      <Link href="/profile">
        <Button
          variant="ghost"
          className="bg-white text-black font-bold border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all px-4 py-1.5 h-auto text-sm rounded-none"
        >
          Profile ({session.role})
        </Button>
      </Link>

      <form action={logoutAction}>
        <Button
          type="submit"
          className="bg-red-500 text-white font-bold border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all px-4 py-1.5 h-auto text-sm rounded-none"
        >
          Logout
        </Button>
      </form>
    </>
  )}
</div>

        {/* MOBILE MENU TOGGLE PLACEHOLDER */}
        {session && (
          <div className="lg:hidden absolute top-14 left-0 w-full bg-white border-2 border-black p-4 flex flex-col gap-4 shadow-[4px_4px_0_0_#000] hidden">
            {getRoleMenus(true)}
          </div>
        )}
      </nav>
      </div>
    </header>
  );
}