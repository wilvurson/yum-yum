'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from "next/link";

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
  const [newOrder, setNewOrder] = useState({ userId: '', items: '' });

  useEffect(() => {
    if (!isLoaded) return;

    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setIsAdmin(data.isAdmin);
        setLoading(false);
      })
      .catch(err => {
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
    const res = await fetch('/api/users/all');
    const data = await res.json();
    setUsers(data);
  };

  const fetchOrders = async () => {
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(data);
  };

  const handleSetAdmin = async (userId: number, isAdmin: boolean) => {
    await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAdmin }),
    });
    fetchUsers();
  };

  const handleCreateOrder = async () => {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: parseInt(newOrder.userId),
        items: newOrder.items,
      }),
    });
    setNewOrder({ userId: '', items: '' });
    fetchOrders();
  };



  return (
    <div className="container mx-auto p-4 border mt-20 rounded-2xl">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] lg:w-[360px]">
        <Link href="/admin/admins">
          <div
           className="text-black">admins</div>
        </Link>
        <Link href="/admin/order">
          <div
          className="text-black">order</div>
        </Link>
      </section>
    </div>
  );
}