import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/retroui/Card";

export default function RegisterCustomerPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Customer Registration</CardTitle>
          <CardDescription>Create your customer account to start exploring events.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="font-semibold" htmlFor="fullName">Full Name</label>
            <Input id="fullName" placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <label className="font-semibold" htmlFor="email">Email</label>
            <Input id="email" type="email" placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <label className="font-semibold" htmlFor="phone">Phone Number</label>
            <Input id="phone" placeholder="+62 812 3456 7890" />
          </div>
          <div className="space-y-2">
            <label className="font-semibold" htmlFor="username">Username</label>
            <Input id="username" placeholder="Choose a username" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-semibold" htmlFor="password">Password</label>
              <Input id="password" type="password" placeholder="Password" />
            </div>
            <div className="space-y-2">
              <label className="font-semibold" htmlFor="confirmPassword">Confirm Password</label>
              <Input id="confirmPassword" type="password" placeholder="Confirm Password" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Create Account</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
