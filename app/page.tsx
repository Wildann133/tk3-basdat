import Link from "next/link";
import { Button } from "@/components/retroui/Button";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  // 1. Ambil session user saat ini
  const session = await getSession();

  // 2. Jika user SUDAH login, langsung arahkan ke Dashboard
  if (session) {
    redirect("/dashboard");
  }

  // 3. Jika BELUM login, tampilkan Landing Page ini
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <h1 className="font-head text-5xl md:text-7xl font-bold mb-4 text-center tracking-tighter">
        Welcome to TikTakTuk
      </h1>
      <p className="text-xl mb-8 text-center max-w-2xl text-muted-foreground">
        The simplest and most radically designed platform for finding, attending, and managing events.
      </p>
      <div className="flex space-x-4">
        <Link href="/login">
          <Button size="lg" className="font-bold border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all rounded-none">
            Log in
          </Button>
        </Link>
        <Link href="/register">
          <Button size="lg" variant="secondary" className="font-bold border-2 border-black bg-[#ffdb33] text-black shadow-[4px_4px_0_0_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all rounded-none">
            Sign up
          </Button>
        </Link>
        <Link href="/ticket-category">
          <Button size="lg" variant="secondary" className="font-bold border-2 border-black bg-[#ffdb33] text-black shadow-[4px_4px_0_0_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all rounded-none">
            See Ticket Categories
          </Button>
        </Link>
      </div>
    </div>
  );
}