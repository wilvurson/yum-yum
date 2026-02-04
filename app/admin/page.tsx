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

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

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

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return <div>Access denied. You are not an admin.</div>;

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-gray-600">
        Select an option from the sidebar to manage your admin tasks.
      </p>
    </div>
  );
}
