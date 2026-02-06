"use client";

import { UserButton, UserAvatar } from "@clerk/nextjs";
import { UserCircle } from "lucide-react"
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow z-50 h-auto">
      <div className="w-auto flex p-4 gap-x-5 justify-around">
        <Link href="/admin">
              <UserCircle className="h-10 w-8 text-stone-500"/>
          </Link>
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
          <Link href="/map">
            <div className="text-black bg-stone-200 rounded-3xl h-auto">
              <div className="h-10 flex flex-col justify-center px-10">
                Map
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
        </div>
        <Link href="/profile">
            <div className="text-black bg-stone-200 rounded-3xl h-10 w-10 flex items-center justify-center">
              <UserAvatar />
            </div>
          </Link>
      </div>
    </header>
  );
}
