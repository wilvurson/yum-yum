"use client";
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

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { db } from "@/lib/firebase"; // Таны үүсгэсэн firebase config
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Handbag, User } from "lucide-react";


// ... (Interface-үүд хэвээрээ үлдэнэ)

export default function AdminOrderPage() {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // 1. Admin мөн эсэхийг шалгах
  useEffect(() => {
    if (!isLoaded) return;
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setIsAdmin(data.isAdmin);
        setLoading(false);
      });
  }, [isLoaded]);

  // 2. Firebase-ээс Real-time өгөгдөл унших (Socket.io-ийн оронд)
  useEffect(() => {
    if (!isAdmin) return;

    // "orders" collection-ийг сонсож эхлэх
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as Order[];

      // Шинэ захиалга нэмэгдсэн эсэхийг шалгаж Toast харуулах
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" && !snapshot.metadata.hasPendingWrites) {
          toast.success("Шинэ захиалга ирлээ!");
          // Хүсвэл энд alert sound тоглуулж болно
        }
      });

      setOrders(ordersData);
    }, (error) => {
      console.error("Firebase subscription error:", error);
      toast.error("Өгөгдөл уншихад алдаа гарлаа");
    });

    // Cleanup: Хуудаснаас гарахад Firebase холболтыг салгана
    return () => unsubscribe();
  }, [isAdmin]);

  // 3. Төлөв шинэчлэх (Firebase update)
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status });
      toast.success("Төлөв шинэчлэгдлээ");
    } catch (error) {
      toast.error("Алдаа гарлаа");
    }
  };

  // 4. Устгах (Firebase delete)
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Устгахдаа итгэлтэй байна уу?")) return;
    try {
      await deleteDoc(doc(db, "orders", orderId));
      toast.success("Захиалга устлаа");
    } catch (error) {
      toast.error("Устгахад алдаа гарлаа");
    }
  };

  if (loading) return <div>Уншиж байна...</div>;
  if (!isAdmin) return <div>Хандах эрхгүй</div>;



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
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Select an option from the sidebar to manage your admin tasks.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {users.length}
                </p>
              </div>
              <div className="bg-primary/10 rounded-lg p-3">
                <User className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {orders.length}
                </p>
              </div>
              <div className="bg-primary/10 rounded-lg p-3">
                <Handbag className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Admin Users
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {users.filter((u) => u.isAdmin).length}
                </p>
              </div>
              <div className="bg-primary/10 rounded-lg p-3">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-8 bg-card rounded-lg border border-border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground mb-2">
            Welcome to Admin Panel
          </h2>
          <p className="text-muted-foreground">
            Use the navigation sidebar to access user management, order
            management, and other admin features. You can create new items,
            manage cuisines and meal types, or view detailed order information.
          </p>
        </div>
      </div>
    </div>
  );
}
