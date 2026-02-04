"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}
interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: number;
  userId: number;
  user: User;
  items: string | OrderItem[];
  status: string;
  createdAt: string;
}

function formatOrderItems(items: string | OrderItem[]) {
  if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      return parsed
        .map((item: OrderItem) => `${item.name} x${item.quantity}`)
        .join(", ");
    } catch {
      return items;
    }
  }
  return items
    .map((item: OrderItem) => `${item.name} x${item.quantity}`)
    .join(", ");
}

function getOrderTotal(items: string | OrderItem[]) {
  if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      return parsed.reduce(
        (sum: number, item: OrderItem) => sum + item.price * item.quantity,
        0,
      );
    } catch {
      return 0;
    }
  }
  return items.reduce(
    (sum: number, item: OrderItem) => sum + item.price * item.quantity,
    0,
  );
}

export default function Admins() {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newOrder, setNewOrder] = useState({ userId: "", items: "" });

  useEffect(() => {
    if (!isLoaded) return;

    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setIsAdmin(data.isAdmin);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [isLoaded]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchOrders();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    const res = await fetch("/api/users/all");
    const data = await res.json();
    setUsers(data);
  };

  const fetchOrders = async () => {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data);
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    await fetch(`/api/orders/${orderId}`, {
      method: "DELETE",
    });
    fetchOrders();
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Orders</h2>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">User</th>
              <th className="border p-2">Items</th>
              <th className="border p-2">Total</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="border p-2">{order.id}</td>
                <td className="border p-2">{order.user.name}</td>
                <td className="border p-2">{formatOrderItems(order.items)}</td>
                <td className="border p-2">
                  ${getOrderTotal(order.items).toFixed(2)}
                </td>
                <td className="border p-2">{order.status}</td>
                <td className="border p-2">
                  <div className="flex gap-1 flex-wrap">
                    <button
                      onClick={() =>
                        handleUpdateOrderStatus(order.id, "pending")
                      }
                      className={`px-2 py-1 text-xs rounded ${
                        order.status === "pending"
                          ? "bg-yellow-200"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateOrderStatus(order.id, "processing")
                      }
                      className={`px-2 py-1 text-xs rounded ${
                        order.status === "processing"
                          ? "bg-blue-200"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      Processing
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateOrderStatus(order.id, "completed")
                      }
                      className={`px-2 py-1 text-xs rounded ${
                        order.status === "completed"
                          ? "bg-green-200"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateOrderStatus(order.id, "cancelled")
                      }
                      className={`px-2 py-1 text-xs rounded ${
                        order.status === "cancelled"
                          ? "bg-red-200"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      Cancelled
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="px-2 py-1 text-xs rounded bg-red-100 hover:bg-red-200 text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
