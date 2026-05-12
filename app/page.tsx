import Link from "next/link";
import { Button } from "@/components/retroui/Button";

export default function Home() {
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
          <Button size="lg" className="font-bold">Log in</Button>
        </Link>
        <Link href="/register">
          <Button size="lg" variant="secondary" className="font-bold">Sign up</Button>
        </Link>
      </div>
    </div>
  );
}
