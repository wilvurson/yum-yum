'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

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

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Create Order</h2>
        <select
          value={newOrder.userId}
          onChange={(e) => setNewOrder({ ...newOrder, userId: e.target.value })}
          className="border p-2 mr-2"
        >
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Items (JSON string)"
          value={newOrder.items}
          onChange={(e) => setNewOrder({ ...newOrder, items: e.target.value })}
          className="border p-2 mr-2"
        />
        <button onClick={handleCreateOrder} className="bg-blue-500 text-white p-2">
          Create Order
        </button>
      </div>

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
                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
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

      <div>
        <h2 className="text-xl font-semibold mb-2">Users</h2>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Admin</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border p-2">{user.id}</td>
                <td className="border p-2">{user.name}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.isAdmin ? 'Yes' : 'No'}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleSetAdmin(user.id, !user.isAdmin)}
                    className={`p-1 ${user.isAdmin ? 'bg-red-500' : 'bg-green-500'} text-white`}
                  >
                    {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}