"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow z-50 h-auto">
      <div className="max-w-6xl flex p-4 gap-x-5">
        <UserButton />
        <div className="flex gap-x-2 w-120">
          <Link href="/home">
            <div className="text-black bg-stone-200 rounded-3xl h-auto">
              <div className="h-10 flex flex-col justify-center px-10">
                Home
              </div>
            </div>
          </Link>
          <Link href="/meal">
            <div className="text-black bg-stone-200 rounded-3xl h-auto">
              <div className="h-10 flex flex-col justify-center px-10">
                Meal
              </div>
            </div>
          </Link>
          <Link href="/grocery">
            <div className="text-black bg-stone-200 rounded-3xl h-auto">
              <div className="h-10 flex flex-col justify-center px-10">
                Grocery
              </div>
            </div>
          </Link>
          <Link href="/admin">
            <div className="text-black bg-stone-200 rounded-3xl h-auto">
              <div className="h-10 flex flex-col justify-center px-10">
                Admin
              </div>
            </div>
          </Link>
          <Link href="/profile">
            <div className="text-black bg-stone-200 rounded-3xl h-auto">
              <div className="h-10 flex flex-col justify-center px-10">
                Profile
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
