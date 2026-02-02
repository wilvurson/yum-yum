"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { toast } from "sonner";

type FormStatus = "idle" | "loading" | "success" | "error";

interface FoodFormState {
  name: string;
  calories: string;
  price: string;
  image: string;
  imageFileName: string;
  mealType: string;
  cuisine: string;
}

interface GroceryFormState {
  name: string;
  unit: string;
  calPerUnit: string;
  price: string;
  image: string;
  imageFileName: string;
}

interface CategoryFormState {
  newCuisine: string;
  newMealType: string;
}

const initialFoodState: FoodFormState = {
  name: "",
  calories: "",
  price: "",
  image: "",
  imageFileName: "",
  mealType: "",
  cuisine: "",
};

const initialGroceryState: GroceryFormState = {
  name: "",
  unit: "",
  calPerUnit: "",
  price: "",
  image: "",
  imageFileName: "",
};

const initialCategoryState: CategoryFormState = {
  newCuisine: "",
  newMealType: "",
};

export default function Create() {
  const [activeTab, setActiveTab] = useState<"food" | "grocery" | "categories">(
    "food",
  );
  const [foodForm, setFoodForm] = useState<FoodFormState>(initialFoodState);
  const [groceryForm, setGroceryForm] =
    useState<GroceryFormState>(initialGroceryState);
  const [mealTypes, setMealTypes] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [categoryForm, setCategoryForm] =
    useState<CategoryFormState>(initialCategoryState);
  const [status, setStatus] = useState<FormStatus>("idle");

  const hasFoodRequired = useMemo(() => {
    return (
      foodForm.name &&
      foodForm.calories &&
      foodForm.price &&
      foodForm.image &&
      foodForm.mealType
    );
  }, [foodForm]);

  const hasGroceryRequired = useMemo(() => {
    return (
      groceryForm.name &&
      groceryForm.unit &&
      groceryForm.calPerUnit &&
      groceryForm.price
    );
  }, [groceryForm]);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [mealRes, cuisineRes] = await Promise.all([
          fetch("/api/mealtypes"),
          fetch("/api/cuisines"),
        ]);
        if (mealRes.ok) {
          setMealTypes(await mealRes.json());
        }
        if (cuisineRes.ok) {
          setCuisines(await cuisineRes.json());
        }
      } catch (error) {
        console.error("Error fetching dropdown data", error);
      }
    };

    fetchLists();
  }, []);

  const handleFoodChange = (field: keyof FoodFormState, value: string) => {
    setFoodForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGroceryChange = (
    field: keyof GroceryFormState,
    value: string,
  ) => {
    setGroceryForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (
    field: keyof CategoryFormState,
    value: string,
  ) => {
    setCategoryForm((prev) => ({ ...prev, [field]: value }));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleFoodFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      handleFoodChange("image", "");
      handleFoodChange("imageFileName", "");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      handleFoodChange("image", base64);
      handleFoodChange("imageFileName", file.name);
    } catch (error) {
      console.error("Failed to read image", error);
    }
  };

  const handleGroceryFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      handleGroceryChange("image", "");
      handleGroceryChange("imageFileName", "");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      handleGroceryChange("image", base64);
      handleGroceryChange("imageFileName", file.name);
    } catch (error) {
      console.error("Failed to read image", error);
    }
  };

  const submitFood = async () => {
    return toast.promise<{ name: string }>(
      async () => {
        const response = await fetch("/api/foods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: foodForm.name,
            calories: foodForm.calories,
            price: foodForm.price,
            image: foodForm.image,
            mealType: foodForm.mealType,
            cuisine: foodForm.cuisine || null,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to create food");
        }

        setFoodForm(initialFoodState);
        return data;
      },
      {
        loading: "Creating food...",
        success: (data) => `Food "${data.name}" created successfully.`,
        error: (error) =>
          error instanceof Error ? error.message : "Failed to create food.",
      },
    );
  };

  const submitGrocery = async () => {
    return toast.promise<{ name: string }>(
      async () => {
        const response = await fetch("/api/grocery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: groceryForm.name,
            unit: groceryForm.unit,
            calPerUnit: groceryForm.calPerUnit,
            price: groceryForm.price,
            image: groceryForm.image || null,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to create grocery item");
        }

        setGroceryForm(initialGroceryState);
        return data;
      },
      {
        loading: "Creating grocery item...",
        success: (data) => `Grocery item "${data.name}" created successfully.`,
        error: (error) =>
          error instanceof Error
            ? error.message
            : "Failed to create grocery item.",
      },
    );
  };

  const submitCuisine = async () => {
    return toast.promise<{ name: string }>(
      async () => {
        const response = await fetch("/api/cuisines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: categoryForm.newCuisine }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to create cuisine");
        }

        setCategoryForm((prev) => ({ ...prev, newCuisine: "" }));
        // Refresh cuisines list
        const cuisineRes = await fetch("/api/cuisines");
        if (cuisineRes.ok) {
          setCuisines(await cuisineRes.json());
        }
        return data;
      },
      {
        loading: "Creating cuisine...",
        success: (data) => `Cuisine "${data.name}" created successfully.`,
        error: (error) =>
          error instanceof Error ? error.message : "Failed to create cuisine.",
      },
    );
  };

  const submitMealType = async () => {
    return toast.promise<{ name: string }>(
      async () => {
        const response = await fetch("/api/mealtypes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: categoryForm.newMealType }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Failed to create meal type");
        }

        setCategoryForm((prev) => ({ ...prev, newMealType: "" }));
        // Refresh meal types list
        const mealRes = await fetch("/api/mealtypes");
        if (mealRes.ok) {
          setMealTypes(await mealRes.json());
        }
        return data;
      },
      {
        loading: "Creating meal type...",
        success: (data) => `Meal type "${data.name}" created successfully.`,
        error: (error) =>
          error instanceof Error
            ? error.message
            : "Failed to create meal type.",
      },
    );
  };

  const resetMessage = () => {
    if (status !== "idle") {
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Create Items</h1>
          <p className="text-sm text-zinc-500">
            Add new foods or grocery items to your catalog.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setActiveTab("food");
              resetMessage();
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "food"
                ? "bg-black text-white"
                : "bg-white text-zinc-700 border border-zinc-200"
            }`}
          >
            Food
          </button>
          <button
            onClick={() => {
              setActiveTab("grocery");
              resetMessage();
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "grocery"
                ? "bg-black text-white"
                : "bg-white text-zinc-700 border border-zinc-200"
            }`}
          >
            Grocery
          </button>
          <button
            onClick={() => {
              setActiveTab("categories");
              resetMessage();
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "categories"
                ? "bg-black text-white"
                : "bg-white text-zinc-700 border border-zinc-200"
            }`}
          >
            Categories
          </button>
        </div>

        {activeTab === "food" ? (
          <div className="grid gap-6 rounded-[24px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm font-medium text-zinc-700">
                Food name
                <input
                  value={foodForm.name}
                  onChange={(event) =>
                    handleFoodChange("name", event.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2"
                  placeholder="Chicken Salad"
                />
              </label>
              <label className="space-y-1 text-sm font-medium text-zinc-700">
                Calories
                <input
                  value={foodForm.calories}
                  onChange={(event) =>
                    handleFoodChange("calories", event.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2"
                  placeholder="450"
                />
              </label>
              <label className="space-y-1 text-sm font-medium text-zinc-700">
                Price
                <input
                  value={foodForm.price}
                  onChange={(event) =>
                    handleFoodChange("price", event.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2"
                  placeholder="9.99"
                />
              </label>
              <label className="space-y-1 text-sm font-medium text-zinc-700">
                Image file
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFoodFileChange}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2"
                />
                {foodForm.imageFileName && (
                  <span className="text-xs text-zinc-500">
                    Selected: {foodForm.imageFileName}
                  </span>
                )}
              </label>
              <label className="space-y-1 text-sm font-medium text-zinc-700">
                Meal type
                <select
                  value={foodForm.mealType}
                  onChange={(event) =>
                    handleFoodChange("mealType", event.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2"
                >
                  <option value="">Select meal type</option>
                  {mealTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm font-medium text-zinc-700">
                Cuisine (optional)
                <select
                  value={foodForm.cuisine}
                  onChange={(event) =>
                    handleFoodChange("cuisine", event.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2"
                >
                  <option value="">No cuisine</option>
                  {cuisines.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={submitFood}
                disabled={!hasFoodRequired || status === "loading"}
                className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {status === "loading" ? "Saving..." : "Create Food"}
              </button>
              {!hasFoodRequired && (
                <span className="text-xs text-zinc-500">
                  Fill in name, calories, price, image, and meal type.
                </span>
              )}
            </div>
          </div>
        ) : activeTab === "categories" ? (
          <div className="grid gap-6 rounded-[24px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">
                  Add Cuisine
                </h3>
                <p className="text-sm text-zinc-500">
                  Create a new cuisine type for your foods.
                </p>
              </div>
              <div className="flex gap-3">
                <input
                  value={categoryForm.newCuisine}
                  onChange={(event) =>
                    handleCategoryChange("newCuisine", event.target.value)
                  }
                  className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-black"
                  placeholder="Italian, Japanese, Mexican, etc."
                />
                <button
                  onClick={submitCuisine}
                  disabled={!categoryForm.newCuisine.trim()}
                  className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  Add Cuisine
                </button>
              </div>
            </div>

            <div className="border-t border-zinc-100" />

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">
                  Add Meal Type
                </h3>
                <p className="text-sm text-zinc-500">
                  Create a new meal type for your foods.
                </p>
              </div>
              <div className="flex gap-3">
                <input
                  value={categoryForm.newMealType}
                  onChange={(event) =>
                    handleCategoryChange("newMealType", event.target.value)
                  }
                  className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-black"
                  placeholder="Breakfast, Lunch, Dinner, Snack, etc."
                />
                <button
                  onClick={submitMealType}
                  disabled={!categoryForm.newMealType.trim()}
                  className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  Add Meal Type
                </button>
              </div>
            </div>

            <div className="border-t border-zinc-100" />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-medium text-zinc-700">
                  Available Cuisines
                </h4>
                <div className="flex flex-wrap gap-2">
                  {cuisines.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700"
                    >
                      {item}
                    </span>
                  ))}
                  {cuisines.length === 0 && (
                    <span className="text-sm text-zinc-400">
                      No cuisines added yet
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium text-zinc-700">
                  Available Meal Types
                </h4>
                <div className="flex flex-wrap gap-2">
                  {mealTypes.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700"
                    >
                      {item}
                    </span>
                  ))}
                  {mealTypes.length === 0 && (
                    <span className="text-sm text-zinc-400">
                      No meal types added yet
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 rounded-[24px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm font-medium text-zinc-700">
                Grocery name
                <input
                  value={groceryForm.name}
                  onChange={(event) =>
                    handleGroceryChange("name", event.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2"
                  placeholder="Bananas"
                />
              </label>
              <label className="space-y-1 text-sm font-medium text-zinc-700">
                Unit
                <input
                  value={groceryForm.unit}
                  onChange={(event) =>
                    handleGroceryChange("unit", event.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2"
                  placeholder="kg"
                />
              </label>
              <label className="space-y-1 text-sm font-medium text-zinc-700">
                Calories per unit
                <input
                  value={groceryForm.calPerUnit}
                  onChange={(event) =>
                    handleGroceryChange("calPerUnit", event.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2"
                  placeholder="89"
                />
              </label>
              <label className="space-y-1 text-sm font-medium text-zinc-700">
                Price
                <input
                  value={groceryForm.price}
                  onChange={(event) =>
                    handleGroceryChange("price", event.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2"
                  placeholder="2.99"
                />
              </label>
              <label className="space-y-1 text-sm font-medium text-zinc-700">
                Image file (optional)
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGroceryFileChange}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2"
                />
                {groceryForm.imageFileName && (
                  <span className="text-xs text-zinc-500">
                    Selected: {groceryForm.imageFileName}
                  </span>
                )}
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={submitGrocery}
                disabled={!hasGroceryRequired || status === "loading"}
                className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {status === "loading" ? "Saving..." : "Create Grocery Item"}
              </button>
              {!hasGroceryRequired && (
                <span className="text-xs text-zinc-500">
                  Fill in name, unit, calories per unit, and price.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
