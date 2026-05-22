"use client";

import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/retroui/Card";
import { registerAction } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterAdministratorPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi tidak sama.");
      return;
    }

    const result = await registerAction(formData, "admin");

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.push("/login");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Administrator Registration</CardTitle>
            <CardDescription>Create an admin account to manage the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm border-2 border-red-500 bg-red-100 text-red-600 p-2 font-bold">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="font-semibold" htmlFor="username">Username</label>
              <Input id="username" name="username" placeholder="Admin username" required />
            </div>
            <div className="space-y-2">
              <label className="font-semibold" htmlFor="password">Password</label>
              <Input id="password" name="password" type="password" placeholder="Password" required />
            </div>
            <div className="space-y-2">
              <label className="font-semibold" htmlFor="confirmPassword">Confirm Password</label>
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm Password" required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" variant="outline" className="w-full text-black">Register as Admin</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
