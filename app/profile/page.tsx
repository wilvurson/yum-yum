"use client";

import { useState, useEffect } from "react";
import Navbar from "../navbar/navber";
import { useUser, SignOutButton } from "@clerk/nextjs";

type UserData = {
  name: string;
  email: string;
};

export default function Page() {
  const { user, isLoaded } = useUser();
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      setUserName(user.fullName || user.firstName || "User");
      setUserEmail(user.primaryEmailAddress?.emailAddress || "");
      setLoading(false);
    } else if (isLoaded && !user) {
      setLoading(false);
    }
  }, [isLoaded, user]);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="px-7 pt-6">
        <Navbar />
      </div>

      <div className="flex justify-center pt-8">
        <div className="mt-4 flex flex-col gap-8 lg:max-w-4xl w-full max-w-2xl">
          {/* Profile Header - Centered */}
          <div className="flex flex-col items-center text-center gap-6">
            <div className="relative">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={userName}
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-[#FFD54A] flex items-center justify-center text-3xl font-bold text-zinc-900">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-zinc-900">
                {loading ? "Loading..." : userName}
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {loading ? "Loading..." : userEmail}
              </p>
            </div>
          </div>

          {/* Profile Sections - Centered */}
          <div className="grid grid-cols-1 gap-6">
            {/* Personal Information */}
            <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900">
                  Personal Information
                </h3>
                <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200">
                  ✏️
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    readOnly
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    readOnly
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none text-zinc-900"
                  />
                </div>
              </div>
            </section>

            {/* Account Settings */}
            <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900">
                  Account Settings
                </h3>
                <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200">
                  ⚙️
                </button>
              </div>

              <div className="mt-6 space-y-3">
                <button className="flex w-full items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-100">
                  <span>Change Password</span>
                  <span>→</span>
                </button>
                <button className="flex w-full items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-100">
                  <span>Notification Preferences</span>
                  <span>→</span>
                </button>
                <button className="flex w-full items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-100">
                  <span>Privacy Settings</span>
                  <span>→</span>
                </button>
              </div>
            </section>

            {/* Activity Stats */}
            <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900">
                  Activity Stats
                </h3>
                <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200">
                  📊
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-lime-50 p-4">
                  <div className="text-xs font-semibold text-zinc-700">
                    Active Days
                  </div>
                  <div className="mt-2 text-lg font-extrabold text-zinc-900">
                    24
                  </div>
                  <div className="text-[10px] text-zinc-500">this month</div>
                </div>
                <div className="rounded-2xl bg-sky-50 p-4">
                  <div className="text-xs font-semibold text-zinc-700">
                    Total Activities
                  </div>
                  <div className="mt-2 text-lg font-extrabold text-zinc-900">
                    156
                  </div>
                  <div className="text-[10px] text-zinc-500">all time</div>
                </div>
                <div className="rounded-2xl bg-purple-50 p-4">
                  <div className="text-xs font-semibold text-zinc-700">
                    Streak
                  </div>
                  <div className="mt-2 text-lg font-extrabold text-zinc-900">
                    7 days
                  </div>
                  <div className="text-[10px] text-zinc-500">keep it up!</div>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4">
                  <div className="text-xs font-semibold text-zinc-700">
                    Completed
                  </div>
                  <div className="mt-2 text-lg font-extrabold text-zinc-900">
                    89%
                  </div>
                  <div className="text-[10px] text-zinc-500">success rate</div>
                </div>
              </div>
            </section>
          </div>

          {/* Sign Out Button */}
          <div className="pt-4">
            <SignOutButton>
              <button className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-100">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </div>
  );
}
