"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

interface UserData {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface OrderItem {
  id: number;
  foodId: number | null;
  groceryItemId: number | null;
  quantity: number;
  price: number;
  food: { id: number; name: string; image: string } | null;
  groceryItem: { id: number; name: string; image: string } | null;
}

interface Order {
  id: number;
  userId: number;
  user: UserData;
  items: OrderItem[];
  status: string;
  deliveryType: string;
  deliveryAddress: string | null;
  createdAt: string;
}

// Helper function to format order items for display
function formatOrderItems(items: OrderItem[]): string {
  if (!items || items.length === 0) return "No items";

  return items
    .map((item) => {
      const name = item.food?.name || item.groceryItem?.name || "Unknown Item";
      return `${name} x${item.quantity}`;
    })
    .join(", ");
}

// Helper function to calculate order total
function getOrderTotal(items: OrderItem[]): number {
  if (!items || items.length === 0) return 0;

  return items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}

export default function AdminOrderPage() {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifiedOrderIds, setNotifiedOrderIds] = useState<Set<string>>(
    new Set(),
  );

  // Load previously notified order IDs from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("notifiedOrderIds");
      if (stored) {
        try {
          setNotifiedOrderIds(new Set(JSON.parse(stored)));
        } catch {
          // ignore parse errors
        }
      }
    }
  }, []);

  // 1. Check if user is admin
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

  // 2. FIREBASE REAL-TIME LISTENING
  useEffect(() => {
    if (!isAdmin) return;

    // Listen to "orders" collection ordered by time
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          // Convert string ID from Firebase to number for UI
          id: isNaN(Number(doc.id)) ? doc.id : Number(doc.id),
        })) as Order[];

        // Track new order IDs to notify
        const newNotifiedIds = new Set(notifiedOrderIds);

        // Show Toast when new order arrives (only for orders we haven't notified about)
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" && !snapshot.metadata.hasPendingWrites) {
            const orderId = change.doc.id;

            // Only show toast if we haven't already notified about this order
            if (!notifiedOrderIds.has(orderId)) {
              const newOrder = change.doc.data();
              toast.success(`New Order #${orderId}`, {
                description: `Customer: ${newOrder.user?.name || "Customer"}`,
              });

              // Add to notified set
              newNotifiedIds.add(orderId);
            }
          }
        });

        // Update notified order IDs and persist to localStorage
        if (newNotifiedIds.size > notifiedOrderIds.size) {
          setNotifiedOrderIds(newNotifiedIds);
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "notifiedOrderIds",
              JSON.stringify([...newNotifiedIds]),
            );
          }
        }

        setOrders(ordersData);
      },
      (error) => {
        console.error("Firebase error:", error);
        toast.error("Real-time connection error");
      },
    );

    // Cleanup: disconnect when leaving page
    return () => unsubscribe();
  }, [isAdmin, notifiedOrderIds]);

  // 3. UPDATE STATUS (API call + Firebase auto-update)
  const handleUpdateOrderStatus = async (
    orderId: number | string,
    status: string,
  ) => {
    try {
      // Update in PostgreSQL
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred");
    }
  };

  // 4. DELETE
  const handleDeleteOrder = async (orderId: number | string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        toast.error("Failed to delete");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card rounded-lg border border-border p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-card-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground">
            You are not an admin. Please contact an administrator for access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Manage Orders
          </h1>
          <p className="text-muted-foreground">
            View and manage all orders. Update order status or delete orders as
            needed.
          </p>
        </div>

        {/* Orders Table */}
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-card-foreground">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-card-foreground">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-card-foreground">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-card-foreground">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-card-foreground">
                    Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-card-foreground">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-card-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-card-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {order.user?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <div className="line-clamp-2">
                          {formatOrderItems(order.items)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">
                        ${getOrderTotal(order.items).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.deliveryType === "home"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {order.deliveryType === "home"
                            ? "Delivery"
                            : "Pickup"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {order.deliveryType === "home" &&
                        order.deliveryAddress ? (
                          <span
                            className="text-xs max-w-[200px] truncate block"
                            title={order.deliveryAddress}
                          >
                            📍 {order.deliveryAddress}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : order.status === "CONFIRMED" ||
                                order.status === "PREPARING"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-wrap gap-1">
                          <button
                            onClick={() =>
                              handleUpdateOrderStatus(order.id, "PENDING")
                            }
                            className={`px-2 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                              order.status === "PENDING"
                                ? "bg-yellow-200 text-yellow-800"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            Pending
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateOrderStatus(order.id, "CONFIRMED")
                            }
                            className={`px-2 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                              order.status === "CONFIRMED"
                                ? "bg-blue-200 text-blue-800"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            Confirmed
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateOrderStatus(order.id, "PREPARING")
                            }
                            className={`px-2 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                              order.status === "PREPARING"
                                ? "bg-blue-200 text-blue-800"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            Preparing
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateOrderStatus(order.id, "DELIVERING")
                            }
                            className={`px-2 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                              order.status === "DELIVERING"
                                ? "bg-purple-200 text-purple-800"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            Delivering
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateOrderStatus(order.id, "COMPLETED")
                            }
                            className={`px-2 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                              order.status === "COMPLETED"
                                ? "bg-green-200 text-green-800"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            Completed
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateOrderStatus(order.id, "CANCELLED")
                            }
                            className={`px-2 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                              order.status === "CANCELLED"
                                ? "bg-red-200 text-red-800"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            Cancelled
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="px-2 py-1 text-xs rounded-md font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {orders.length}
            </p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-700 mt-1">
              {orders.filter((o) => o.status === "PENDING").length}
            </p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-700 mt-1">
              {orders.filter((o) => o.status === "COMPLETED").length}
            </p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Cancelled</p>
            <p className="text-2xl font-bold text-red-700 mt-1">
              {orders.filter((o) => o.status === "CANCELLED").length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
