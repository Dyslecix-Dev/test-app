import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">You are offline</h1>
      <p className="text-muted-foreground mt-2">Please check your internet connection and try again.</p>
    </div>
  );
}
