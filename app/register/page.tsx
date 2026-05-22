import Link from "next/link";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/retroui/Card";

export default function RegisterPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <h1 className="font-head text-4xl mb-2 text-center">Join TikTakTuk</h1>
      <p className="text-gray-600 mb-8 text-center max-w-lg">Choose your role to get started and create your account.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card className="hover:-translate-y-2 transition-transform duration-300 h-full flex flex-col">
          <CardHeader>
            <CardTitle>Customer</CardTitle>
            <CardDescription>I want to buy tickets and attend events.</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Link href="/register/customer">
              <Button className="w-full">Sign up as Customer</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:-translate-y-2 transition-transform duration-300 h-full flex flex-col">
          <CardHeader>
            <CardTitle>Organizer</CardTitle>
            <CardDescription>I want to create events and sell tickets.</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Link href="/register/organizer">
              <Button variant="secondary" className="w-full">Sign up as Organizer</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:-translate-y-2 transition-transform duration-300 h-full flex flex-col">
          <CardHeader>
            <CardTitle>Administrator</CardTitle>
            <CardDescription>I manage the platform and users.</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Link href="/register/administrator">
              <Button variant="outline" className="w-full text-black">Sign up as Admin</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
