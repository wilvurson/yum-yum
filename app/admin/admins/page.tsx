"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

export default function Admins() {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
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
      }
    }, [isAdmin]);

    const fetchUsers = async () => {
      const res = await fetch("/api/users/all");
      const data = await res.json();
      setUsers(data);
    };


  const handleSetAdmin = async (userId: number, isAdmin: boolean) => {
    await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAdmin }),
    });
    fetchUsers();
  };

  return (
    <div>
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
                <td className="border p-2">{user.isAdmin ? "Yes" : "No"}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleSetAdmin(user.id, !user.isAdmin)}
                    className={`p-1 ${user.isAdmin ? "bg-red-500" : "bg-green-500"} text-white cursor-pointer`}
                  >
                    {user.isAdmin ? "Remove Admin" : "Make Admin"}
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
