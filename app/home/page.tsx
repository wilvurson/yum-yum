"use client";

import { useMemo, useState, useEffect } from "react";
import Navbar from "../navbar/navber";

type ScheduleItem = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  activity: string;
  completed: boolean;
};

type UserData = {
  name: string;
};

export default function Page() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [timeHours, setTimeHours] = useState("");
  const [timeMinutes, setTimeMinutes] = useState("");
  const [timeAmPm, setTimeAmPm] = useState<"AM" | "PM">("AM");
  const [activity, setActivity] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [userName, setUserName] = useState("User");
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Force re-render every second to update time-based colors
  const [, setTick] = useState(0);
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toTimeString().slice(0, 5));
      setTick((t) => t + 1); // Force re-render
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // Ensure user is DB and fetch user data
    fetch("/api/users", { method: "POST" })
      .then((res) => {
        if (!res.ok) {
          console.error("Failed to ensure user in DB");
        }
        return fetch("/api/users");
      })
      .then((res) => res.json())
      .then((data: UserData) => {
        if (data.name) {
          setUserName(data.name);
        }
      })
      .catch((err) => console.error("Error ensuring user:", err));

    // Set initial selected date and fetch schedules
    setSelectedDate(today);
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
      date: string;
      day: number;
      shortDay: string;
      isToday: boolean;
    }[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - 1 + i);
      out.push({
        key: d.toDateString(),
        date: d.toISOString().split("T")[0],
        day: d.getDate(),
        shortDay: d.toLocaleDateString("en", { weekday: "short" }),
        isToday: i === 1,
      });
    }
    return out;
  }, []);

  const fetchSchedulesForDate = (date: string) => {
    setSelectedDate(date);
    fetch(`/api/schedules?date=${date}`)
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
  };

  // Convert 24-hour format (HH:MM) to 12-hour format with AM/PM
  const formatTimeWithAmPm = (time24: string) => {
    const [hours24, minutes] = time24.split(":").map(Number);
    const period = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Get time status: 'active' (current), 'passed' (past), or 'future'
  // Get time status: 'active' (from start until +1 min), 'passed' (after +1 min), or 'future'
  const getTimeStatus = (
    item: ScheduleItem,
  ): "active" | "passed" | "future" => {
    const now = new Date();

    const [startHours, startMinutes] = item.startTime.split(":").map(Number);
    const startTimeDate = new Date();
    startTimeDate.setHours(startHours, startMinutes, 0, 0);

    const passedTime = new Date(startTimeDate.getTime() + 60000); // +1 minute

    if (now >= passedTime) return "passed";
    if (now >= startTimeDate) return "active";
    return "future";
  };

  // Convert time (HH:MM) to position percentage (0-100) for timeline
  // Based on the schedule's time range
  const getItemPosition = (
    time: string,
    minTime: number,
    maxTime: number,
  ): number => {
    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;

    const range = maxTime - minTime;
    if (range <= 0) return 0;

    const pct = ((totalMinutes - minTime) / range) * 100;
    return Math.max(0, Math.min(100, pct));
  };

  // Get current time position for NOW marker
  // Based on the schedule's time range
  const getNowPosition = (minTime: number, maxTime: number): number => {
    const now = new Date();
    const totalMinutes =
      now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

    const range = maxTime - minTime;
    if (range <= 0) return 0;

    const pct = ((totalMinutes - minTime) / range) * 100;
    return Math.max(0, Math.min(100, pct));
  };

  // Calculate time range from schedule
  const timeRange =
    schedule.length > 0
      ? {
          min: Math.min(
            ...schedule.map((s) => {
              const [h, m] = s.startTime.split(":").map(Number);
              return h * 60 + m;
            }),
          ),
          max: Math.max(
            ...schedule.map((s) => {
              const [h, m] = s.endTime.split(":").map(Number);
              return h * 60 + m;
            }),
          ),
        }
      : { min: 0, max: 1440 };

  const formatItem = (item: ScheduleItem) => {
    return `${formatTimeWithAmPm(item.startTime)} ${item.activity}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 p-8 text-black dark:text-white transition-colors">
      {/* Navbar */}
      <div className="px-7 pt-6">
        <Navbar />
      </div>

      {/* Greeting + Search */}
      <div className="px-7 pt-4">
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Hello{" "}
              <span className="text-zinc-900 dark:text-zinc-100">
                "{userName}"
              </span>
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {schedule.length === 0
                ? "You have no activities today"
                : `You have ${schedule.length} activities today`}
            </p>
          </div>

          <div className="flex w-full max-w-xl items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800 px-4 py-3">
            <span className="text-zinc-400 dark:text-zinc-500">🔎</span>
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-900 dark:text-zinc-100"
              placeholder="Search by recipes and more"
            />
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="px-7 pb-8 pt-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* LEFT + CENTER */}
          <div className="flex-1 white">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
              {/* LEFT: Schedule */}
              <section className="rounded-[28px] bg-white dark:bg-zinc-900 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    View today's schedule
                  </h3>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  >
                    ✏️
                  </button>
                </div>

                {/* Date pills */}
                <div className="mt-4 flex items-center justify-between gap-2">
                  <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                    ‹
                  </button>

                  <div className="flex gap-2">
                    {dates.map((d) => (
                      <button
                        key={d.key}
                        onClick={() => fetchSchedulesForDate(d.date)}
                        className={[
                          "flex flex-col items-center justify-center rounded-2xl px-3 py-2 text-center transition-colors",
                          selectedDate === d.date
                            ? "bg-[#FFD54A] text-emerald-700"
                            : d.isToday
                            ? "bg-lime-400"
                            : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700",
                        ].join(" ")}
                      >
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {d.day}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {d.shortDay}
                        </div>
                      </button>
                    ))}
                  </div>

                  <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                    ›
                  </button>
                </div>

                {/* Timeline list - Real-time timeline */}
                <div className="mt-5 relative">
                  {schedule.length === 0 ? (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
                      No activities for this date
                    </p>
                  ) : (
                    <div className="relative pl-10 h-[320px]">
                      {/* Constant vertical line */}
                      <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-zinc-200 dark:bg-zinc-700" />

                      {/* NOW marker - moves in real time */}
                      <div
                        className="absolute left-0 right-0 h-0.5 bg-[#FFD54A] z-20 pointer-events-none"
                        style={{
                          top: `${getNowPosition(
                            timeRange.min,
                            timeRange.max,
                          )}%`,
                          transform: "translateY(-50%)",
                        }}
                      >
                        <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FFD54A] rounded-full border-2 border-white shadow-md flex items-center justify-center">
                          <span className="text-[8px] font-bold text-emerald-700">
                            NOW
                          </span>
                        </div>
                      </div>

                      {/* Time labels on left */}
                      <div className="absolute left-[-45px] top-0 bottom-0 flex flex-col justify-between py-2 text-[10px] text-zinc-400 dark:text-zinc-500">
                        <span>
                          {formatTimeWithAmPm(
                            `${Math.floor(timeRange.min / 60)
                              .toString()
                              .padStart(2, "0")}:${(timeRange.min % 60)
                              .toString()
                              .padStart(2, "0")}`,
                          )}
                        </span>
                        <span>
                          {formatTimeWithAmPm(
                            `${Math.floor(
                              (timeRange.min + timeRange.max) / 2 / 60,
                            )
                              .toString()
                              .padStart(2, "0")}:${Math.floor(
                              ((timeRange.min + timeRange.max) / 2) % 60,
                            )
                              .toString()
                              .padStart(2, "0")}`,
                          )}
                        </span>
                        <span>
                          {formatTimeWithAmPm(
                            `${Math.floor(timeRange.max / 60)
                              .toString()
                              .padStart(2, "0")}:${(timeRange.max % 60)
                              .toString()
                              .padStart(2, "0")}`,
                          )}
                        </span>
                      </div>

                      {/* Schedule items positioned by time */}
                      {[...schedule]
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((item, idx) => {
                          const status = getTimeStatus(item);
                          const isCompleted = item.completed;
                          const position = getItemPosition(
                            item.startTime,
                            timeRange.min,
                            timeRange.max,
                          );
                          const dotColor = isCompleted
                            ? "bg-stone-300 dark:bg-stone-600"
                            : status === "active"
                            ? "bg-emerald-500"
                            : status === "passed"
                            ? "bg-red-500"
                            : "bg-zinc-400 dark:bg-zinc-600";
                          const textColor = isCompleted
                            ? "text-stone-300 dark:text-stone-500"
                            : status === "active"
                            ? "text-zinc-900 dark:text-zinc-100"
                            : status === "passed"
                            ? "text-red-500"
                            : "text-zinc-500 dark:text-zinc-400";
                          return (
                            <div
                              key={item.id}
                              className="absolute left-0 right-0 flex items-center gap-4 group"
                              style={{
                                top: `${position}%`,
                                transform: "translateY(-50%)",
                              }}
                            >
                              {/* Colored dot on the line */}
                              <div
                                className={`absolute left-[9px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${dotColor} shadow-sm z-10`}
                              />

                              {/* Content */}
                              <div className="flex-1 ml-8">
                                <div
                                  className={`text-[12px] leading-5 ${textColor} ${
                                    isCompleted ? "line-through" : ""
                                  }`}
                                >
                                  {formatItem(item)}
                                </div>
                              </div>
                              {/* Buttons - show on hover */}
                              <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                {status !== "passed" && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        const res = await fetch(
                                          "/api/schedules",
                                          {
                                            method: "PATCH",
                                            headers: {
                                              "Content-Type":
                                                "application/json",
                                            },
                                            body: JSON.stringify({
                                              id: item.id,
                                              completed: !item.completed,
                                            }),
                                          },
                                        );
                                        if (res.ok) {
                                          const updated = await res.json();
                                          setSchedule(
                                            schedule.map((s) =>
                                              s.id === item.id ? updated : s,
                                            ),
                                          );
                                        }
                                      } catch (err) {
                                        console.error(err);
                                      }
                                    }}
                                    className={`grid h-5 w-5 place-items-center rounded border transition-colors ${
                                      item.completed
                                        ? "border-emerald-500 bg-emerald-500 text-white"
                                        : "border-zinc-300 hover:border-emerald-400"
                                    }`}
                                  >
                                    {item.completed ? "^" : ""}
                                  </button>
                                )}
                                <button
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(
                                        `/api/schedules?id=${item.id}`,
                                        {
                                          method: "DELETE",
                                        },
                                      );
                                      if (res.ok) {
                                        setSchedule(
                                          schedule.filter(
                                            (s) => s.id !== item.id,
                                          ),
                                        );
                                      }
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Add item form */}
                {showForm && (
                  <div className="mt-5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 shadow-sm transition-all duration-300 ease-in-out">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Time
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={2}
                            value={timeHours}
                            onChange={(e) => {
                              const val = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 2);
                              setTimeHours(val);
                              if (val.length === 2 && timeMinutes.length < 2) {
                                document
                                  .getElementById("time-minutes")
                                  ?.focus();
                              }
                            }}
                            placeholder="HH"
                            className="w-14 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 px-2 py-2 text-center text-sm outline-none focus:border-[#7B61FF] focus:ring-1 focus:ring-[#7B61FF] text-zinc-900 dark:text-zinc-100"
                          />
                          <span className="text-zinc-500 dark:text-zinc-400">
                            :
                          </span>
                          <input
                            id="time-minutes"
                            type="text"
                            maxLength={2}
                            value={timeMinutes}
                            onChange={(e) => {
                              const val = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 2);
                              setTimeMinutes(val);
                            }}
                            placeholder="MM"
                            className="w-14 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 px-2 py-2 text-center text-sm outline-none focus:border-[#7B61FF] focus:ring-1 focus:ring-[#7B61FF] text-zinc-900 dark:text-zinc-100"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setTimeAmPm(timeAmPm === "AM" ? "PM" : "AM")
                            }
                            className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 px-3 py-2 text-sm font-medium outline-none focus:border-[#7B61FF] focus:ring-1 focus:ring-[#7B61FF] text-zinc-900 dark:text-zinc-100"
                          >
                            {timeAmPm}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Activity
                        </label>
                        <input
                          type="text"
                          value={activity}
                          onChange={(e) => setActivity(e.target.value)}
                          placeholder="Enter activity"
                          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 px-3 py-2 text-sm outline-none focus:border-[#7B61FF] focus:ring-1 focus:ring-[#7B61FF] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowForm(false)}
                          className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            const hours = parseInt(timeHours) || 0;
                            const minutes = parseInt(timeMinutes) || 0;

                            if (
                              hours < 1 ||
                              hours > 12 ||
                              minutes < 0 ||
                              minutes > 59 ||
                              !activity
                            ) {
                              alert("Please enter valid time and activity");
                              return;
                            }

                            // Convert to 24-hour format
                            let hours24 = hours;
                            if (timeAmPm === "PM" && hours !== 12)
                              hours24 = hours + 12;
                            if (timeAmPm === "AM" && hours === 12) hours24 = 0;

                            const startTime24 = `${hours24
                              .toString()
                              .padStart(2, "0")}:${minutes
                              .toString()
                              .padStart(2, "0")}`;

                            // Calculate endTime as 1 hour after startTime
                            const endHours = (hours24 + 1) % 24;
                            const endTime24 = `${endHours
                              .toString()
                              .padStart(2, "0")}:${minutes
                              .toString()
                              .padStart(2, "0")}`;

                            try {
                              const res = await fetch("/api/schedules", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  date: selectedDate || today,
                                  startTime: startTime24,
                                  endTime: endTime24,
                                  activity,
                                }),
                              });
                              if (res.ok) {
                                const newItem = await res.json();
                                setSchedule([...schedule, newItem]);
                                setTimeHours("");
                                setTimeMinutes("");
                                setTimeAmPm("AM");
                                setActivity("");
                                setShowForm(false);
                              }
                            } catch (err) {
                              console.error(err);
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
                {/* Report */}
                <section className="rounded-[28px] bg-white dark:bg-zinc-900 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Report
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        Goals this week
                      </div>
                    </div>
                    <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                      ⋯
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-sky-50 dark:bg-sky-950/30 p-4">
                      <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Water
                      </div>
                      <div className="mt-6 text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                        2500ml
                      </div>
                      <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        Goal: 3L
                      </div>
                    </div>
                    <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 p-4">
                      <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Weight
                      </div>
                      <div className="mt-6 text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                        62kg
                      </div>
                      <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        Goal: 0kg
                      </div>
                    </div>
                    <div className="rounded-2xl bg-lime-50 dark:bg-lime-950/30 p-4">
                      <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        BPM
                      </div>
                      <div className="mt-6 text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                        72
                      </div>
                      <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        Goal: 2000kcal
                      </div>
                    </div>
                    <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/30 p-4">
                      <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Sleep
                      </div>
                      <div className="mt-6 text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                        8h
                      </div>
                      <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        10:00 PM - 6:00 AM
                      </div>
                    </div>
                  </div>
                </section>

                {/* Categories */}
                <section className="rounded-[28px] bg-white dark:bg-zinc-900 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Categories
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        Choose your category
                      </div>
                    </div>
                    <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                      ⋯
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {[
                      {
                        name: "Meal",
                        icon: "🍽️",
                        color: "bg-orange-50 dark:bg-orange-950/30",
                      },
                      {
                        name: "Grocery",
                        icon: "🛒",
                        color: "bg-green-50 dark:bg-green-950/30",
                      },
                      {
                        name: "Map",
                        icon: "🗺️",
                        color: "bg-blue-50 dark:bg-blue-950/30",
                      },
                      {
                        name: "Workout",
                        icon: "💪",
                        color: "bg-purple-50 dark:bg-purple-950/30",
                      },
                    ].map((category) => (
                      <a
                        key={category.name}
                        href={`/${category.name.toLowerCase()}`}
                        className="flex flex-col items-center gap-2 rounded-2xl p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${category.color}`}
                        >
                          {category.icon}
                        </div>
                        <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          {category.name}
                        </div>
                      </a>
                    ))}
                  </div>
                </section>

                {/* Special for you */}
                <section className="rounded-[28px] bg-white dark:bg-zinc-900 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Special for you
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        Recommended based on your interests
                      </div>
                    </div>
                    <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                      ⋯
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      {
                        title: "Avocado Toast with Poached Egg",
                        time: "15 min",
                        calories: "320 kcal",
                        color: "bg-orange-50 dark:bg-orange-950/30",
                      },
                      {
                        title: "Grilled Chicken Salad",
                        time: "25 min",
                        calories: "450 kcal",
                        color: "bg-green-50 dark:bg-green-950/30",
                      },
                    ].map((recipe, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 rounded-2xl bg-white dark:bg-zinc-800 p-3 shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-700"
                      >
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-xl text-2xl ${recipe.color}`}
                        >
                          🥗
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">
                            {recipe.title}
                          </div>
                          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            {recipe.time} • {recipe.calories}
                          </div>
                        </div>
                        <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600">
                          ➜
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* RIGHT: Leaderboard & Friends */}
          <div className="space-y-6 lg:w-[280px]">
            {/* Leaderboard */}
            <section className="rounded-[28px] bg-white dark:bg-zinc-900 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Leaderboard
                </div>
                <button className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                  See all
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: "Alex",
                    score: 1250,
                    rank: 1,
                    color: "bg-amber-100 dark:bg-amber-900/40",
                  },
                  {
                    name: "Sam",
                    score: 980,
                    rank: 2,
                    color: "bg-zinc-100 dark:bg-zinc-700/40",
                  },
                  {
                    name: "Jordan",
                    score: 870,
                    rank: 3,
                    color: "bg-orange-100 dark:bg-orange-900/40",
                  },
                  {
                    name: "You",
                    score: 720,
                    rank: 4,
                    color: "bg-lime-100 dark:bg-lime-900/40",
                  },
                ].map((user) => (
                  <div
                    key={user.rank}
                    className="flex items-center gap-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 p-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      {user.rank}
                    </div>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${user.color}`}
                    >
                      👤
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {user.name}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {user.score}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Add Friends */}
            <section className="rounded-[28px] bg-white dark:bg-zinc-900 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Add friends
                </div>
                <button className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                  See all
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Taylor", mutual: 4, status: "Follows you" },
                  { name: "Morgan", mutual: 2, status: "Follows you" },
                  { name: "Casey", mutual: 1, status: "New to app" },
                ].map((friend, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 p-2"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-lg">
                      👤
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {friend.name}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {friend.mutual} mutual friends • {friend.status}
                      </div>
                    </div>
                    <button className="rounded-lg bg-[#7B61FF] px-3 py-1 text-xs font-medium text-white hover:opacity-95">
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Upcoming Birthdays */}
            <section className="rounded-[28px] bg-white dark:bg-zinc-900 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Upcoming Birthdays
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: "Riley",
                    date: "Today",
                    color: "bg-pink-100 dark:bg-pink-900/40",
                  },
                  {
                    name: "Avery",
                    date: "Tomorrow",
                    color: "bg-purple-100 dark:bg-purple-900/40",
                  },
                  {
                    name: "Quinn",
                    date: "Dec 28",
                    color: "bg-blue-100 dark:bg-blue-900/40",
                  },
                ].map((birthday, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 p-2"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${birthday.color}`}
                    >
                      🎂
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {birthday.name}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {birthday.date}
                      </div>
                    </div>
                    <button className="rounded-lg border border-zinc-200 dark:border-zinc-600 px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700">
                      Wish
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
