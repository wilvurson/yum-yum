"use client";

import { useMemo, useState, useEffect } from "react";
import Navbar from "../navbar/navber"; // keep your navbar if you want

type ScheduleItem = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  activity: string;
};

export default function Page() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [activity, setActivity] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // Ensure user is in DB
    fetch("/api/users", { method: "POST" })
      .then((res) => {
        if (!res.ok) {
          console.error("Failed to ensure user in DB");
        }
      })
      .catch((err) => console.error("Error ensuring user:", err));

    fetch(`/api/schedules?date=${today}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSchedule(data);
        } else {
          console.error("Invalid data format:", data);
          setSchedule([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setSchedule([]);
      });
  }, [today]);

  const dates = useMemo(() => {
    const today = new Date();
    const out: {
      key: string;
      day: number;
      shortDay: string;
      isToday: boolean;
    }[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - 1 + i);
      out.push({
        key: d.toDateString(),
        day: d.getDate(),
        shortDay: d.toLocaleDateString("en", { weekday: "short" }),
        isToday: i === 1,
      });
    }
    return out;
  }, []);

  const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM

  const isActive = (item: ScheduleItem) => {
    return currentTime >= item.startTime && currentTime <= item.endTime;
  };

  const formatItem = (item: ScheduleItem) => {
    return `${item.startTime}  •  ${item.activity}`;
  };

  return (
    <div className="min-h-screen bg-white p-8 bg-[#f2f1ef]">
      {/* Outer white dashboard */}
      {/* Optional: your own navbar */}
      <div className="px-7 pt-6">
        <Navbar />
      </div>

      {/* Top pill navigation + right user */}
      <div className="px-7 pt-4">
        {/* Greeting + Search */}
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-[#f2f1ef]">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">
              Hello, <span className="text-zinc-900">Jessica</span>
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              You have 8 activities today
            </p>
          </div>

          <div className="flex w-full max-w-xl items-center gap-2 rounded-full bg-zinc-100 px-4 py-3">
            <span className="text-zinc-400">🔎</span>
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
              placeholder="Search by recipes and more"
            />
            <button className="grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm">
              🎛️
            </button>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="px-7 pb-8 pt-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* LEFT + CENTER in one wide card area */}
          <div className="flex-1 bg-[#f2f1ef]">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
              {/* LEFT: Schedule */}
              <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900">
                    View today's schedule
                  </h3>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200"
                  >
                    ✏️
                  </button>
                </div>

                {/* Date pills */}
                <div className="mt-4 flex items-center justify-between gap-2">
                  <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200">
                    ‹
                  </button>

                  <div className="flex gap-2">
                    {dates.map((d) => (
                      <div
                        key={d.key}
                        className={[
                          "flex flex-col items-center justify-center rounded-2xl px-3 py-2 text-center",
                          d.isToday ? "bg-[#FFD54A]" : "bg-zinc-100",
                        ].join(" ")}
                      >
                        <div className="text-sm font-semibold text-zinc-900">
                          {d.day}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {d.shortDay}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200">
                    ›
                  </button>
                </div>

                {/* Timeline list */}
                <div className="mt-5 space-y-4">
                  {schedule.map((item, idx) => {
                    const active = isActive(item);
                    return (
                      <div key={idx} className="relative pl-7">
                        <div className="absolute left-0 top-1.5 grid h-5 w-5 place-items-center rounded-full border border-zinc-200 bg-white">
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${active ? "bg-emerald-500" : "bg-zinc-400"}`}
                          />
                        </div>
                        <div
                          className={`text-[12px] leading-5 ${active ? "text-zinc-900" : "text-zinc-500"}`}
                        >
                          {formatItem(item)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add item form */}
                {showForm && (
                  <div className="mt-5 rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm transition-all duration-300 ease-in-out">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">
                          Time Range
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-[#7B61FF] focus:ring-1 focus:ring-[#7B61FF]"
                            placeholder="Start time"
                          />
                          <span className="self-center text-sm text-zinc-500">
                            to
                          </span>
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-[#7B61FF] focus:ring-1 focus:ring-[#7B61FF]"
                            placeholder="End time"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">
                          Activity
                        </label>
                        <select
                          value={activity}
                          onChange={(e) => setActivity(e.target.value)}
                          className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-[#7B61FF] focus:ring-1 focus:ring-[#7B61FF]"
                        >
                          <option value="">Select an activity</option>
                          <option value="🍽️ Eat">🍽️ Eat</option>
                          <option value="🥤 Drink">🥤 Drink</option>
                          <option value="🏃 Run">🏃 Run</option>
                          <option value="💪 Exercise">💪 Exercise</option>
                          <option value="💼 Work">💼 Work</option>
                          <option value="😴 Rest">😴 Rest</option>
                          <option value="✨ Other">✨ Other</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowForm(false)}
                          className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            if (startTime && endTime && activity) {
                              try {
                                const res = await fetch("/api/schedules", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    date: today,
                                    startTime,
                                    endTime,
                                    activity,
                                  }),
                                });
                                if (res.ok) {
                                  const newItem = await res.json();
                                  setSchedule([...schedule, newItem]);
                                  setStartTime("");
                                  setEndTime("");
                                  setActivity("");
                                  setShowForm(false);
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            }
                          }}
                          className="flex-1 rounded-lg bg-[#7B61FF] py-2 text-sm font-semibold text-white hover:opacity-95"
                        >
                          Add to Schedule
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* CENTER: Cards */}
              <div className="space-y-6">
                {/* Top row: Report + Shopping list */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Report */}
                  <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-zinc-900">
                          Report
                        </div>
                        <div className="text-xs text-zinc-500">
                          Goals this week
                        </div>
                      </div>
                      <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200">
                        ⋯
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-sky-50 p-4">
                        <div className="text-xs font-semibold text-zinc-700">
                          Water
                        </div>
                        <div className="mt-6 text-lg font-extrabold text-zinc-900">
                          2500ml
                        </div>
                        <div className="mt-1 text-[11px] text-zinc-500">
                          Goal 3L
                        </div>
                      </div>
                      <div className="rounded-2xl bg-amber-50 p-4">
                        <div className="text-xs font-semibold text-zinc-700">
                          Weight
                        </div>
                        <div className="mt-6 text-lg font-extrabold text-zinc-900">
                          62kg
                        </div>
                        <div className="mt-1 text-[11px] text-zinc-500">
                          Goal 56kg
                        </div>
                      </div>
                      <div className="rounded-2xl bg-lime-50 p-4">
                        <div className="text-xs font-semibold text-zinc-700">
                          BPM
                        </div>
                        <div className="mt-6 text-lg font-extrabold text-zinc-900">
                          95bpm
                        </div>
                        <div className="mt-1 text-[11px] text-zinc-500">
                          15min ago
                        </div>
                      </div>
                      <div className="rounded-2xl bg-rose-50 p-4">
                        <div className="text-xs font-semibold text-zinc-700">
                          Calories
                        </div>
                        <div className="mt-6 text-lg font-extrabold text-zinc-900">
                          320kcal
                        </div>
                        <div className="mt-1 text-[11px] text-zinc-500">
                          Left 1150
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Shopping list */}
                  <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-zinc-900">
                        Shopping list
                      </div>
                      <button className="grid h-8 w-8 place-items-center rounded-full bg-black text-white">
                        ?
                      </button>
                    </div>

                    <div className="mt-4 space-y-3 text-sm">
                      {[
                        {
                          name: "Avocados",
                          qty: "2 pc",
                          checked: true,
                          icon: "🥑",
                        },
                        {
                          name: "Salmon fillets",
                          qty: "2 x 150g",
                          checked: true,
                          icon: "🐟",
                        },
                        {
                          name: "Yogurt",
                          qty: "200g",
                          checked: false,
                          icon: "🥣",
                          tag: "AI Suggested",
                        },
                        {
                          name: "Dark chocolate almonds",
                          qty: "50g",
                          checked: false,
                          icon: "🍫",
                        },
                        {
                          name: "Red Onion",
                          qty: "1/4 piece",
                          checked: false,
                          icon: "🧅",
                        },
                        {
                          name: "Lettuce",
                          qty: "2 pc",
                          checked: false,
                          icon: "🥬",
                        },
                      ].map((it) => (
                        <div
                          key={it.name}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={[
                                "grid h-5 w-5 place-items-center rounded-md border",
                                it.checked
                                  ? "border-emerald-400 bg-emerald-50"
                                  : "border-zinc-200 bg-white",
                              ].join(" ")}
                            >
                              {it.checked ? "✓" : ""}
                            </div>
                            <div className="flex items-center gap-2">
                              <span>{it.icon}</span>
                              <span className="text-zinc-800">{it.name}</span>
                              {it.tag ? (
                                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                                  {it.tag}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <div className="text-xs text-zinc-500">{it.qty}</div>
                        </div>
                      ))}
                    </div>

                    <button className="mt-5 w-full rounded-full bg-[#FFD54A] py-3 text-sm font-extrabold text-zinc-900 hover:brightness-95">
                      🛒 Shop Now
                    </button>
                  </section>
                </div>

                {/* Bottom row: Daily intake + Activity + Promo */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Daily intake */}
                  <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-zinc-900">
                        Daily intake
                      </div>
                      <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200">
                        ⋯
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      {[
                        { label: "Veg", value: "70", icon: "🥦" },
                        { label: "Prot", value: "90", icon: "🍗" },
                        { label: "Carb", value: "300", icon: "🍞" },
                      ].map((it) => (
                        <div
                          key={it.label}
                          className="flex-1 rounded-2xl bg-zinc-50 p-3"
                        >
                          <div className="flex items-center gap-2 text-xs text-zinc-600">
                            <span>{it.icon}</span> {it.label}
                          </div>
                          <div className="mt-2 text-lg font-extrabold text-zinc-900">
                            {it.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 text-xs text-zinc-500">
                      Water 2.5 / 3L
                    </div>
                    <div className="mt-2 flex items-end gap-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className={[
                            "w-7 rounded-xl border border-zinc-200 bg-white",
                            i < 5 ? "h-14" : "h-10",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "mx-auto mt-1 w-[80%] rounded-lg",
                              i < 5
                                ? "h-[70%] bg-sky-200"
                                : "h-[45%] bg-sky-200",
                            ].join(" ")}
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Activity */}
                  <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-zinc-900">
                        Activity
                      </div>
                      <button className="grid h-8 w-8 place-items-center rounded-full bg-black text-white">
                        ?
                      </button>
                    </div>

                    <div className="mt-5 flex items-end gap-3">
                      {[
                        { day: "Sun", h: "h-12" },
                        { day: "Mon", h: "h-16" },
                        { day: "Tue", h: "h-24" },
                        { day: "Wed", h: "h-20" },
                        { day: "Thu", h: "h-10" },
                      ].map((b) => (
                        <div
                          key={b.day}
                          className="flex flex-col items-center gap-2"
                        >
                          <div
                            className={`w-6 ${b.h} rounded-full bg-[#7B61FF]/70`}
                          />
                          <div className="text-[11px] text-zinc-500">
                            {b.day}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Promo */}
                  <section className="rounded-[28px] bg-[#7B61FF] p-6 text-white shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
                    <div className="text-sm font-semibold">
                      Got a Recipe That Rocks?
                    </div>
                    <div className="mt-2 text-xs text-white/80">
                      Share it & help your recipe list become the next big hit!
                    </div>

                    <div className="mt-4 rounded-2xl bg-white/15 p-4">
                      <div className="flex items-center gap-1 text-lg">
                        ★★★★★
                      </div>
                      <div className="mt-2 text-sm font-semibold">
                        Got a Recipe That Rocks?
                      </div>
                      <button className="mt-4 w-full rounded-full border border-white/40 bg-white/10 py-2 text-sm font-semibold hover:bg-white/15">
                        + Add Recipe
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Recipe card */}
          <aside className="w-full lg:w-[320px]">
            <div className="rounded-[32px] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
              <div className="p-4">
                <div className="overflow-hidden rounded-[26px]">
                  <div className="h-44 w-full bg-zinc-200">
                    {/* Replace with your real image */}
                    <img
                      src="https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&w=900&q=80"
                      alt="Shrimp stir fry"
                      className="h-44 w-full object-cover"
                    />
                  </div>
                </div>

                <div className="mt-4 px-1">
                  <h2 className="text-2xl font-extrabold leading-tight text-zinc-900">
                    Shrimp Stir-
                    <br />
                    Fry with
                    <br />
                    Brown Rice
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                    A quick and healthy stir-fry with succulent shrimp, colorful
                    vegetables, and a side of brown rice.
                  </p>

                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Main dish
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                    <span className="rounded-full bg-zinc-100 px-3 py-1">
                      🍽 360kcal
                    </span>
                    <span className="rounded-full bg-zinc-100 px-3 py-1">
                      ⏱ 45min
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-semibold text-zinc-900">
                      Ingredients
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs text-zinc-600">
                      {[
                        { icon: "🍤", label: "60g" },
                        { icon: "🍚", label: "100g" },
                        { icon: "🧄", label: "1/2 piece" },
                        { icon: "🥬", label: "20g" },
                        { icon: "🧂", label: "10ml" },
                        { icon: "🫙", label: "10ml" },
                      ].map((it, i) => (
                        <div key={i} className="rounded-2xl bg-zinc-50 p-3">
                          <div className="text-lg">{it.icon}</div>
                          <div className="mt-1">{it.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                    <div className="inline-flex items-center gap-2">
                      <span className="text-orange-500">🔥</span>
                      <span className="font-semibold text-zinc-800">
                        Medium
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-3">
                      <span>👍 21.8k</span>
                      <span>👁 164.1k</span>
                    </div>
                  </div>

                  <button className="mt-4 w-full rounded-full bg-zinc-100 py-3 text-sm font-extrabold text-zinc-900 hover:bg-zinc-200">
                    Explore Recipe →
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
