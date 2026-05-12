import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/retroui/Card";

export default function RegisterAdministratorPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Administrator Registration</CardTitle>
          <CardDescription>Create an admin account to manage the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="font-semibold" htmlFor="username">Username</label>
            <Input id="username" placeholder="Admin username" />
          </div>
          <div className="space-y-2">
            <label className="font-semibold" htmlFor="password">Password</label>
            <Input id="password" type="password" placeholder="Password" />
          </div>
          <div className="space-y-2">
            <label className="font-semibold" htmlFor="confirmPassword">Confirm Password</label>
            <Input id="confirmPassword" type="password" placeholder="Confirm Password" />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full text-black">Register as Admin</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
