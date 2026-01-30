"use client";

import { useEffect, useState } from "react";
import Navbar from "../navbar/navber";

interface GroceryItem {
  id: number;
  name: string;
  unit: string;
  calPerUnit: string;
  image?: string;
  price: number;
}

export default function GroceryPage() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/grocery");
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Error fetching grocery items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
        <Navbar/>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Fresh Grocery Items
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden transform hover:scale-105 transition-transform duration-300"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {item.name}
                </h2>
                <p className="text-gray-600 mb-2">Unit: {item.unit}</p>
                <p className="text-gray-600 mb-4">
                  Calories per unit: {item.calPerUnit}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">
                    ${Number(item.price).toFixed(2)}
                  </span>
                  <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-300">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
