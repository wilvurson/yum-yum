"use client";

import { useUser } from "@clerk/nextjs";
import { UserCircle } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Navbar() {
  const { user, isLoaded } = useUser();

  // Safely get userName - prefer fullName, fallback to firstName, then username, then email
  const userName =
    user?.fullName ||
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    "User";
  return (
    <header className="fixed top-0 left-0 w-full bg-white dark:bg-zinc-950 shadow dark:shadow-lg z-50 h-auto transition-colors">
      <div className="w-auto flex p-4 gap-x-5 justify-around">
        <Link href="/admin">
          <UserCircle className="h-10 w-8 text-stone-500 dark:text-stone-400" />
        </Link>
        <div className="flex gap-x-2 w-120">
          <Link href="/home">
            <div className="text-black dark:text-white bg-stone-200 dark:bg-zinc-800 rounded-3xl h-auto hover:bg-stone-300 dark:hover:bg-zinc-700 transition-colors">
              <div className="h-10 flex flex-col justify-center px-10">
                Home
              </div>
            </div>
          </Link>
          <Link href="/meal">
            <div className="text-black dark:text-white bg-stone-200 dark:bg-zinc-800 rounded-3xl h-auto hover:bg-stone-300 dark:hover:bg-zinc-700 transition-colors">
              <div className="h-10 flex flex-col justify-center px-10">
                Meal
              </div>
            </div>
          </Link>
          <Link href="/map">
            <div className="text-black dark:text-white bg-stone-200 dark:bg-zinc-800 rounded-3xl h-auto hover:bg-stone-300 dark:hover:bg-zinc-700 transition-colors">
              <div className="h-10 flex flex-col justify-center px-10">Map</div>
            </div>
          </Link>
          <Link href="/grocery">
            <div className="text-black dark:text-white bg-stone-200 dark:bg-zinc-800 rounded-3xl h-auto hover:bg-stone-300 dark:hover:bg-zinc-700 transition-colors">
              <div className="h-10 flex flex-col justify-center px-10">
                Grocery
              </div>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/profile">
            <div className="text-black dark:text-white bg-stone-200 dark:bg-zinc-800 rounded-3xl h-10 w-10 flex items-center justify-center hover:bg-stone-300 dark:hover:bg-zinc-700 transition-colors">
              <div className="relative">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={userName}
                    className="h-10 w-10 rounded-full object-cover border-4 border-white dark:border-zinc-800 shadow-lg"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-[#FFD54A] flex items-center justify-center text-3xl font-bold text-zinc-900">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
