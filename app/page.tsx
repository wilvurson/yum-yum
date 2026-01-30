"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      const timer = setTimeout(() => {
        router.push("/home");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [router, isSignedIn]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <SignedOut>
          <h1 className="text-3xl font-semibold mb-4">Welcome to YumYum</h1>
          <p className="mb-6">Please sign in to continue.</p>
          <SignInButton />
        </SignedOut>

        <SignedIn>
          <h1 className="text-3xl font-semibold mb-4">Welcome back!</h1>
          <p className="mb-6">Redirecting to your dashboard...</p>
          <UserButton />
        </SignedIn>
      </main>
    </div>
  );
}
