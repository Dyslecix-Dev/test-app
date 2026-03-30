"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type ComponentPropsWithoutRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function LoginForm({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // TODO: update the fallback route to your app's main authenticated route
      const next = searchParams.get("next");
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/protected";
      router.push(safeNext);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: uncomment the handler and buttons below to enable OTP sign-in
  // const [message, setMessage] = useState<string | null>(null);
  // const [otpSent, setOtpSent] = useState(false);
  // const [otp, setOtp] = useState("");
  //
  // const handleSendOtp = async () => {
  //   const supabase = createClient();
  //   setIsLoading(true);
  //   setError(null);
  //   setMessage(null);
  //
  //   try {
  //     const { error } = await supabase.auth.signInWithOtp({ email });
  //     if (error) throw error;
  //     setOtpSent(true);
  //     setMessage("Check your email for a 6-digit code.");
  //   } catch (error: unknown) {
  //     setError(error instanceof Error ? error.message : "An error occurred");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  //
  // const handleVerifyOtp = async () => {
  //   const supabase = createClient();
  //   setIsLoading(true);
  //   setError(null);
  //
  //   try {
  //     const { error } = await supabase.auth.verifyOtp({
  //       email,
  //       token: otp,
  //       type: "email",
  //     });
  //     if (error) throw error;
  //     router.push("/protected");
  //   } catch (error: unknown) {
  //     setError(error instanceof Error ? error.message : "An error occurred");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/auth/forgot-password" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" type="password" required disabled={isLoading} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && (
                <p className="text-sm text-red-500" role="alert">
                  {error}
                </p>
              )}
              {/* TODO: uncomment to show OTP success message */}
              {/* {message && <p className="text-sm text-green-600">{message}</p>} */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              {/* TODO: uncomment to enable OTP sign-in */}
              {/* {!otpSent ? (
                <Button type="button" variant="outline" className="w-full" disabled={isLoading || !email} onClick={handleSendOtp}>
                  Sign in with code
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Input id="otp" type="text" inputMode="numeric" placeholder="Enter 6-digit code" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} />
                  <Button type="button" variant="outline" className="w-full" disabled={isLoading || otp.length !== 6} onClick={handleVerifyOtp}>
                    Verify code
                  </Button>
                </div>
              )} */}
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/sign-up" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
