"use client";

import { useState, useEffect } from "react";
import Navbar from "../navbar/navber";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

interface Food {
  id: number;
  name: string;
  image: string;
  price: number;
  mealType: {
    name: string;
  };
}

interface CartItem extends Food {
  quantity: number;
}

export default function Page() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [mealTypes, setMealTypes] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [mode, setMode] = useState<"meal" | "cuisine">("meal");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

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

  const addToCart = (food: Food) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === food.id);
      if (existing) {
        return prev.map((item) =>
          item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { ...food, quantity: 1 }];
    });
  };

  const removeFromCart = (foodId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== foodId));
  };

  const updateQuantity = (foodId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === foodId ? { ...item, quantity } : item)),
      );
    }
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 p-8 relative transition-colors">
      {/* Navbar */}
      <div className="px-7 pt-6">
        <Navbar />
      </div>

      {/* Top pill navigation + right user */}
      <div className="px-7 pt-4">
        {/* Greeting + Search */}
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Explore Meals
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Discover delicious foods for every meal
            </p>
          </div>

          <div className="flex w-full max-w-xl items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800 px-4 py-3">
            <span className="text-zinc-400 dark:text-zinc-500">🔎</span>
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-900 dark:text-zinc-100"
              placeholder="Search for foods and recipes"
            />
            <button className="grid h-8 w-8 place-items-center rounded-full bg-white dark:bg-zinc-700 shadow-sm">
              🍽️
            </button>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="px-7 pb-8 pt-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* LEFT: Meal Selection */}
          <section className="rounded-[28px] bg-white dark:bg-zinc-900 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.3)] lg:w-[360px]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {mode === "meal" ? "Meal Types" : "Cuisines"}
              </h3>
              {mode === "cuisine" && (
                <button
                  onClick={() => {
                    setMode("meal");
                    setSelectedItem(null);
                    setFoods([]);
                  }}
                  className="grid h-8 w-8 place-items-center rounded-full cursor-pointer bg-black dark:bg-zinc-700 text-white"
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
                      : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
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
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    Foods for {selectedItem}
                  </h2>
                )}
                {foods.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {foods.map((food) => (
                      <div
                        key={food.id}
                        className="bg-white dark:bg-zinc-800 p-4 rounded-[20px] shadow-[0_8px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)] transition-shadow flex flex-col border border-zinc-100 dark:border-zinc-700"
                      >
                        <img
                          src={food.image}
                          alt={food.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {food.name}
                          </h3>
                          <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            ${Number(food.price).toFixed(2)}
                          </p>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          {food.mealType.name}
                        </p>
                        <Button
                          className="w-full mt-3"
                          size="sm"
                          onClick={() => addToCart(food)}
                        >
                          Buy
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : selectedItem ? (
                  <p className="text-zinc-500 dark:text-zinc-400">
                    No foods found for {selectedItem}.
                  </p>
                ) : (
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Select a meal type or cuisine to view foods.
                  </p>
                )}
              </div>

              {/* RIGHT: Meal Stats or Recommendations */}
              <div className="space-y-6">
                {/* Popular Meals */}
                <section className="rounded-[28px] bg-white dark:bg-zinc-900 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Popular Meals
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        This week
                      </div>
                    </div>
                    <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
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
                        <div className="w-8 h-8 bg-[#7B61FF]/10 dark:bg-[#7B61FF]/20 rounded-full flex items-center justify-center">
                          🍽️
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {item.name}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            {item.orders} orders
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Nutrition Tips */}
                <section className="rounded-[28px] bg-white dark:bg-zinc-900 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Nutrition Tips
                    </div>
                    <button className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                      💡
                    </button>
                  </div>

                  <div className="mt-4 text-xs text-zinc-600 dark:text-zinc-400">
                    Balance your plate with 50% vegetables, 25% protein, and 25%
                    whole grains for optimal nutrition.
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cart Button */}
      <Button
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg bg-[#7B61FF] hover:bg-[#6a52e0] z-50"
        size="icon"
        onClick={() => setIsDrawerOpen(true)}
      >
        <div className="relative">
          <span className="text-lg">🛒</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </div>
      </Button>

      {/* Cart Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="h-[70vh] bg-white dark:bg-zinc-900">
          <DrawerHeader className="flex flex-row items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-4">
            <div>
              <DrawerTitle className="text-zinc-900 dark:text-zinc-100">
                Your Cart
              </DrawerTitle>
              <DrawerDescription className="text-zinc-500 dark:text-zinc-400">
                {cartCount} item{cartCount !== 1 ? "s" : ""} in your cart
              </DrawerDescription>
            </div>
            <DrawerClose className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700">
              <X className="h-4 w-4 text-black dark:text-zinc-100" />
            </DrawerClose>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-zinc-500 dark:text-zinc-400">
                <span className="text-4xl mb-2">🛒</span>
                <p>Your cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                      {item.name}
                    </h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      ${Number(item.price).toFixed(2)} each
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        -
                      </Button>
                      <span className="w-8 text-center text-zinc-900 dark:text-zinc-100">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <DrawerFooter className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
                  Total
                </span>
                <span className="font-bold text-xl text-[#7B61FF]">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
              <Button
                className="w-full bg-[#7B61FF] hover:bg-[#6a52e0]"
                size="lg"
                onClick={async () => {
                  if (!isLoaded || !user) {
                    alert("Please sign in to checkout");
                    return;
                  }

                  try {
                    // Get the user ID from Clerk and map to database user
                    const email = user.primaryEmailAddress?.emailAddress;
                    if (!email) {
                      alert("Could not get user email");
                      return;
                    }

                    // Fetch user from our database
                    const userRes = await fetch(
                      `/api/users?email=${encodeURIComponent(email)}`,
                    );
                    if (!userRes.ok) {
                      alert("User not found");
                      return;
                    }
                    const dbUser = await userRes.json();

                    // Create order with cart items
                    const items = cart.map((item) => ({
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      quantity: item.quantity,
                      image: item.image,
                    }));

                    const orderRes = await fetch("/api/orders", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        userId: dbUser.id,
                        items: JSON.stringify(items),
                        status: "pending",
                      }),
                    });

                    if (orderRes.ok) {
                      // Clear cart and navigate
                      setCart([]);
                      setIsDrawerOpen(false);
                      router.push("/admin/order");
                    } else {
                      alert("Failed to create order");
                    }
                  } catch (error) {
                    console.error("Checkout error:", error);
                    alert("An error occurred during checkout");
                  }
                }}
              >
                Checkout
              </Button>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
