"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/retroui/Button";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#fdfdfc] flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-6">
        <h1 className="text-9xl font-black tracking-tighter border-b-8 border-black inline-block px-4">
          404
        </h1>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold uppercase">Halaman Tidak Ditemukan</h2>
          <p className="text-zinc-600 font-medium max-w-sm mx-auto">
            Maaf, kami tidak bisa menemukan halaman yang Anda cari.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
          <Link href="/">
            <Button className="bg-yellow-400 text-black border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all font-bold px-6 py-2 h-auto">
              <Home className="w-4 h-4 mr-2" />
              Beranda
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="border-2 border-black font-bold px-6 py-2 h-auto"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>
      </div>
    </div>
  );
}
