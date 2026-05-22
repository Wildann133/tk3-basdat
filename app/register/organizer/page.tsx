"use client";

import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/retroui/Card";
import { registerAction } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterOrganizerPage() {
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

    const result = await registerAction(formData, "organizer");

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.push("/login");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Organizer Registration</CardTitle>
            <CardDescription>Create your organizer account to host events and sell tickets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm border-2 border-red-500 bg-red-100 text-red-600 p-2 font-bold">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="font-semibold" htmlFor="fullName">Full Name</label>
              <Input id="fullName" name="fullName" placeholder="Jane Doe" required />
            </div>
            <div className="space-y-2">
              <label className="font-semibold" htmlFor="email">Email</label>
              <Input id="email" name="email" type="email" placeholder="jane@example.com" required />
            </div>
            <div className="space-y-2">
              <label className="font-semibold" htmlFor="phone">Phone Number</label>
              <Input id="phone" name="phone" placeholder="+62 812 3456 7890" />
            </div>
            <div className="space-y-2">
              <label className="font-semibold" htmlFor="username">Username</label>
              <Input id="username" name="username" placeholder="Choose a username" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-semibold" htmlFor="password">Password</label>
                <Input id="password" name="password" type="password" placeholder="Password" required />
              </div>
              <div className="space-y-2">
                <label className="font-semibold" htmlFor="confirmPassword">Confirm Password</label>
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm Password" required />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" variant="secondary" className="w-full">Create Organizer Account</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
