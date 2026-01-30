"use client";

import { useState } from "react";
import Navbar from "../navbar/navber";

interface GroceryItem {
  name: string;
  qty: string;
  checked: boolean;
  icon: string;
  tag?: string;
}

export default function Page() {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([
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
  ]);

  const toggleItem = (index: number) => {
    const newItems = [...groceryItems];
    newItems[index].checked = !newItems[index].checked;
    setGroceryItems(newItems);
  };

  const checkedCount = groceryItems.filter((item) => item.checked).length;
  const totalItems = groceryItems.length;

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Navbar */}
      <div className="px-7 pt-6">
        <Navbar />
      </div>

      {/* Top pill navigation + right user */}
      <div className="px-7 pt-4">
        {/* Greeting + Search */}
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">
              Grocery Shopping
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {checkedCount} of {totalItems} items completed
            </p>
          </div>

          <div className="flex w-full max-w-xl items-center gap-2 rounded-full bg-zinc-100 px-4 py-3">
            <span className="text-zinc-400">🔎</span>
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
              placeholder="Search grocery items"
            />
            <button className="grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm">
              🛒
            </button>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="px-7 pb-8 pt-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* LEFT: Categories */}
          <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] lg:w-[360px]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900">
                Categories
              </h3>
              <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200">
                +
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {[
                "Fruits & Vegetables",
                "Meat & Seafood",
                "Dairy",
                "Snacks",
                "Pantry",
              ].map((category) => (
                <button
                  key={category}
                  className="block w-full text-left p-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          {/* CENTER + RIGHT */}
          <div className="flex-1">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
              {/* CENTER: Shopping List */}
              <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Shopping List
                  </h3>
                  <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200">
                    ✏️
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {groceryItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid h-5 w-5 place-items-center rounded-md border cursor-pointer ${
                            item.checked
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-zinc-200 bg-white"
                          }`}
                          onClick={() => toggleItem(idx)}
                        >
                          {item.checked ? "✓" : ""}
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{item.icon}</span>
                          <span
                            className={`text-sm ${item.checked ? "text-zinc-500 line-through" : "text-zinc-800"}`}
                          >
                            {item.name}
                          </span>
                          {item.tag && (
                            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                              {item.tag}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-zinc-500">{item.qty}</div>
                    </div>
                  ))}
                </div>

                <button className="mt-5 w-full rounded-full bg-[#FFD54A] py-3 text-sm font-extrabold text-zinc-900 hover:brightness-95">
                  🛒 Shop Now
                </button>
              </section>

              {/* RIGHT: Shopping Stats */}
              <div className="space-y-6">
                {/* Progress */}
                <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">
                        Progress
                      </div>
                      <div className="text-xs text-zinc-500">
                        This shopping trip
                      </div>
                    </div>
                    <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200">
                      📊
                    </button>
                  </div>

                  <div className="mt-4">
                    <div className="text-2xl font-extrabold text-zinc-900">
                      {Math.round((checkedCount / totalItems) * 100)}%
                    </div>
                    <div className="mt-2 w-full bg-zinc-200 rounded-full h-2">
                      <div
                        className="bg-[#7B61FF] h-2 rounded-full"
                        style={{
                          width: `${(checkedCount / totalItems) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </section>

                {/* Budget */}
                <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-zinc-900">
                      Budget
                    </div>
                    <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200">
                      💰
                    </button>
                  </div>

                  <div className="mt-4">
                    <div className="text-lg font-extrabold text-zinc-900">
                      $45.67
                    </div>
                    <div className="text-xs text-zinc-500">
                      of $60.00 budgeted
                    </div>
                    <div className="mt-2 w-full bg-zinc-200 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                </section>

                {/* Tips */}
                <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-zinc-900">
                      Shopping Tips
                    </div>
                    <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200">
                      💡
                    </button>
                  </div>

                  <div className="mt-4 text-xs text-zinc-600">
                    Check your list twice and stick to your budget for smarter
                    shopping.
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
