"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}
interface Order {
  id: number;
  userId: number;
  user: User;
  items: string;
  status: string;
  createdAt: string;
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

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  const fetchOrders = async () => {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data);
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
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="border p-2">{order.id}</td>
                <td className="border p-2">{order.user.name}</td>
                <td className="border p-2">{order.items}</td>
                <td className="border p-2">{order.status}</td>
                <td className="border p-2">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleUpdateOrderStatus(order.id, e.target.value)
                    }
                    className="border p-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
