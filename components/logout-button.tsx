"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError("Failed to log out. Please try again.");
      setIsLoading(false);
      return;
    }
    router.push("/auth/login");
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={logout} disabled={isLoading}>
        {isLoading ? "Logging out..." : "Logout"}
      </Button>
      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
