import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const requestBody = {
      email,
      username,
      password,
      password2,
      phone_number: phoneNumber,
      company_name: companyName,
    };


    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        // credentials: "include", // This is important for cookies if your backend uses them
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Register failed");
      }

      // if (data.access) {
      //   localStorage.setItem("token", data.access);
      //   // If you have a refresh token
      //   if (data.refresh) {
      //     localStorage.setItem("refreshToken", data.refresh);
      //   }
      // }

      // Redirect user to dashboard or home page
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Register Akun Anda</h1>
      </div>
      <div className="grid gap-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="username">Nama</Label>
          <Input 
            id="username" 
            type="text" 
            placeholder="Jane Doe" 
            required 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input 
            id="password" 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password2">Konfirmasi Password</Label>
          </div>
          <Input 
            id="password2" 
            type="password" 
            required 
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="phone_number">Phone Number</Label>
          </div>
          <Input 
            id="phone_number" 
            type="tel" 
            required 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="company_name">Company Name</Label>
          </div>
          <Input 
            id="company_name" 
            type="text" 
            required 
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Registering" : "Register"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Sudah punya akun?{" "}
        <a href="/login" className="underline underline-offset-4">
          Login
        </a>
      </div>
    </form>
  );
}