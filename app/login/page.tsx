"use client";

import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/retroui/Card";
import { loginAction } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);
    
    if (result && result.error) {
      setError(result.error);
    } else {
      router.push("/dashboard");
      router.refresh(); // forces the navbar to update reading new cookie session
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-full">
      <Card className="w-full max-w-md border-4 border-black shadow-[8px_8px_0_0_#000]">
        <form onSubmit={handleSubmit}>
          <CardHeader className="bg-primary text-black border-b-4 border-black rounded-t-lg">
            <CardTitle className="font-head text-3xl">Welcome Back</CardTitle>
            <CardDescription className="text-black/80 font-bold">Log in to access TikTakTuk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {error && <div className="text-sm border-2 border-red-500 bg-red-100 text-red-600 p-2 font-bold mb-4">{error}</div>}
            <div className="space-y-2">
              <label className="font-bold text-sm tracking-widest uppercase" htmlFor="username">Username</label>
              <Input name="username" id="username" placeholder="Masukkan admin atau org" required className="border-2 border-black" />
            </div>
            <div className="space-y-2">
              <label className="font-bold text-sm tracking-widest uppercase" htmlFor="password">Password</label>
              <Input name="password" id="password" type="password" placeholder="Bebas diset aja..." required className="border-2 border-black" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 p-6 pt-0 bg-white rounded-b-lg">
            <Button type="submit" className="w-full bg-black text-white hover:bg-zinc-800 border-4 border-black font-bold text-lg h-12 shadow-[4px_4px_0_0_#000] transition-transform hover:translate-y-1 hover:translate-x-1 hover:shadow-none">Log In</Button>
            <div className="text-sm font-bold text-center mt-4 border-t-2 border-black pt-4">
              Belum punya akun? <a href="/register" className="text-primary-foreground underline hover:text-black hover:bg-primary transition-colors px-1">Daftar sekarang</a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
