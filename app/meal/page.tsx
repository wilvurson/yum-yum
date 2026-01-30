"use client";

import { useState, useEffect } from "react";
import Navbar from "../navbar/navber";

interface Food {
  id: number;
  name: string;
  image: string;
  price: number;
  mealType: {
    name: string;
  };
}

export default function Page() {
  const [mealTypes, setMealTypes] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [mode, setMode] = useState<"meal" | "cuisine">("meal");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);

  useEffect(() => {
    const fetchMealTypes = async () => {
      try {
        const response = await fetch("/api/mealtypes");
        if (response.ok) {
          const data = await response.json();
          setMealTypes([...data, "Cuisine"]);
        } else {
          console.error("Failed to fetch meal types");
        }
      } catch (error) {
        console.error("Error fetching meal types:", error);
      }
    };

    fetchMealTypes();
  }, []);

  const handleItemClick = async (item: string) => {
    if (mode === "meal") {
      if (item === "Cuisine") {
        setMode("cuisine");
        try {
          const response = await fetch("/api/cuisines");
          if (response.ok) {
            const data = await response.json();
            setCuisines(data);
          } else {
            console.error("Failed to fetch cuisines");
          }
        } catch (error) {
          console.error("Error fetching cuisines:", error);
        }
        setSelectedItem(null);
        setFoods([]);
      } else {
        setSelectedItem(item);
        try {
          const response = await fetch(`/api/foods?mealType=${item}`);
          if (response.ok) {
            const data = await response.json();
            setFoods(data);
          } else {
            console.error("Failed to fetch foods");
            setFoods([]);
          }
        } catch (error) {
          console.error("Error fetching foods:", error);
          setFoods([]);
        }
      }
    } else if (mode === "cuisine") {
      setSelectedItem(item);
      try {
        const response = await fetch(`/api/foods?cuisine=${item}`);
        if (response.ok) {
          const data = await response.json();
          setFoods(data);
        } else {
          console.error("Failed to fetch foods");
          setFoods([]);
        }
      } catch (error) {
        console.error("Error fetching foods:", error);
        setFoods([]);
      }
    }
  };

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
              Explore Meals
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Discover delicious foods for every meal
            </p>
          </div>

          <div className="flex w-full max-w-xl items-center gap-2 rounded-full bg-zinc-100 px-4 py-3">
            <span className="text-zinc-400">🔎</span>
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
              placeholder="Search for foods and recipes"
            />
            <button className="grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm">
              🍽️
            </button>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="px-7 pb-8 pt-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* LEFT: Meal Selection */}
          <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] lg:w-[360px]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900">
                {mode === "meal" ? "Meal Types" : "Cuisines"}
              </h3>
              {mode === "cuisine" && (
                <button
                  onClick={() => {
                    setMode("meal");
                    setSelectedItem(null);
                    setFoods([]);
                  }}
                  className="grid h-8 w-8 place-items-center rounded-full cursor-pointer bg-black"
                >
                  ←
                </button>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {(mode === "meal" ? mealTypes : cuisines).map((item) => (
                <button
                  key={item}
                  onClick={() => handleItemClick(item)}
                  className={`block w-full text-left p-3 rounded-2xl transition-colors ${
                    selectedItem === item
                      ? "bg-[#7B61FF] text-white"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          {/* CENTER + RIGHT */}
          <div className="flex-1">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
              {/* CENTER: Foods Grid */}
              <div className="space-y-6">
                {selectedItem && (
                  <h2 className="text-xl font-bold text-zinc-900">
                    Foods for {selectedItem}
                  </h2>
                )}
                {foods.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {foods.map((food) => (
                      <div
                        key={food.id}
                        className="bg-white p-4 rounded-[20px] shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-shadow flex flex-col border border-zinc-100"
                      >
                        <img
                          src={food.image}
                          alt={food.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-semibold text-zinc-900">
                            {food.name}
                          </h3>
                          <p className="font-bold text-sm text-zinc-900">
                            ${Number(food.price).toFixed(2)}
                          </p>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          {food.mealType.name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : selectedItem ? (
                  <p className="text-zinc-500">
                    No foods found for {selectedItem}.
                  </p>
                ) : (
                  <p className="text-zinc-500">
                    Select a meal type or cuisine to view foods.
                  </p>
                )}
              </div>

              {/* RIGHT: Meal Stats or Recommendations */}
              <div className="space-y-6">
                {/* Popular Meals */}
                <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">
                        Popular Meals
                      </div>
                      <div className="text-xs text-zinc-500">This week</div>
                    </div>
                    <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200">
                      ⋯
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      { name: "Breakfast Burrito", orders: 42 },
                      { name: "Grilled Chicken Salad", orders: 28 },
                      { name: "Pasta Primavera", orders: 35 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#7B61FF]/10 rounded-full flex items-center justify-center">
                          🍽️
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-zinc-900">
                            {item.name}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {item.orders} orders
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Nutrition Tips */}
                <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-zinc-900">
                      Nutrition Tips
                    </div>
                    <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200">
                      💡
                    </button>
                  </div>

                  <div className="mt-4 text-xs text-zinc-600">
                    Balance your plate with 50% vegetables, 25% protein, and 25%
                    whole grains for optimal nutrition.
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
