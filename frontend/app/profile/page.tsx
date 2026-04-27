import { Button } from "@/components/retroui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import { User, Key, Mail, Phone, Building } from "lucide-react";
import Link from "next/link";

import { getSession } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await getSession();
  const role = session?.role || "customer";

  // Mocking variables based on role to simulate document requirements
  let isCustomer = role === "customer";
  let isOrganizer = role === "organizer";

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 max-w-6xl mx-auto w-full min-h-full">
      
      {/* HEADER BENTO */}
      <div className="bg-primary text-black p-6 md:p-10 rounded-2xl border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <span className="inline-block px-3 py-1 bg-white border-2 border-black font-bold uppercase tracking-widest text-xs mb-3 shadow-[2px_2px_0_0_#000]">
            Profile Manajemen
          </span>
          <h1 className="text-4xl md:text-5xl font-head tracking-tighter mb-2">Akun Saya</h1>
          <p className="text-black/80 font-medium">Perbarui informasi personal dan kata sandi Anda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* PROFILE INFORMATION */}
        <Card className="col-span-1 md:col-span-2 bg-white border-4 border-black shadow-[6px_6px_0_0_#000]">
          <CardHeader className="border-b-4 border-black pb-4 bg-zinc-100 rounded-t-lg flex flex-row items-center gap-3">
            <div className="bg-black text-white p-2 border-2 border-black rounded-lg">
              <User size={24} />
            </div>
            <div>
              <CardTitle className="text-2xl font-head">Informasi Akun</CardTitle>
              <CardDescription className="text-zinc-600 font-bold">Role Aktif: {role.toUpperCase()}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="space-y-2">
               <label className="text-sm font-bold uppercase tracking-wider text-zinc-500">Username <span className="text-red-500">* (Tidak dapat diubah)</span></label>
               <Input disabled defaultValue={isOrganizer ? "@andiwijaya" : "budisantoso"} className="bg-zinc-100 opacity-70 cursor-not-allowed" />
            </div>

            {isCustomer && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2"><User size={16}/> Nama Lengkap</label>
                  <Input defaultValue="Budi Santoso" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2"><Phone size={16}/> Nomor Telepon</label>
                  <Input defaultValue="08123456789" />
                </div>
              </>
            )}

            {isOrganizer && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2"><Building size={16}/> Nama Organizer</label>
                  <Input defaultValue="Andi Wijaya Events" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2"><Mail size={16}/> Contact Email</label>
                  <Input type="email" defaultValue="andi@organizer.com" />
                </div>
              </>
            )}

            {(!isCustomer && !isOrganizer) && (
              <div className="bg-primary/20 p-4 border-l-4 border-primary mt-4">
                 <p className="font-bold">Admin tidak memiliki profil publik tambahan.</p>
              </div>
            )}

            <div className="pt-4 flex justify-end">
               <Button className="bg-primary text-black border-4 border-black hover:bg-primary-hover shadow-[4px_4px_0_0_#000] font-bold text-lg px-8">Simpan Perubahan</Button>
            </div>
          </CardContent>
        </Card>

        {/* UDPATE PASSWORD CARD */}
        <Card className="col-span-1 bg-secondary text-white border-4 border-black shadow-[6px_6px_0_0_#000] h-fit">
          <CardHeader className="border-b-4 border-zinc-700 pb-4 flex flex-row items-center gap-3">
            <div className="bg-white text-black p-2 border-2 border-black rounded-lg">
              <Key size={24} />
            </div>
            <div>
              <CardTitle className="text-xl font-head tracking-wide">Ubah Sandi</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Password Lama</label>
               <Input type="password" placeholder="••••••••" className="text-black bg-white" />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Password Baru</label>
               <Input type="password" placeholder="Masukan sandi baru" className="text-black bg-white" />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Konfirmasi Password</label>
               <Input type="password" placeholder="Ulangi sandi baru" className="text-black bg-white" />
            </div>
            
            <div className="pt-4">
               <Button className="w-full bg-white text-black border-4 border-black hover:bg-zinc-200 shadow-[4px_4px_0_0_#000] font-bold">Update Password</Button>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Dev helper removed since we now use genuine server session flow */}

    </div>
  );
}
