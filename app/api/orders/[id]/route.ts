import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { db } from "@/lib/firebase"; // Firebase тохиргоо
import { doc, setDoc, deleteDoc } from "firebase/firestore";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // ... (Admin шалгах хэсэг хэвээрээ үлдэнэ) ...
    const { status } = await request.json();
    const { id } = await params;

    // 1. Prisma-аар PostgreSQL-д хадгалах
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        user: true,
        items: { include: { food: true, groceryItem: true } },
      },
    });

    // 2. Firebase рүү мэдээлэх (Socket.io-ийн оронд)
    try {
      // Firebase-ийн "orders" цуглуулгад orderId-гаар нь датаг шинэчилнэ
      await setDoc(doc(db, "orders", id), {
        ...JSON.parse(JSON.stringify(order)), // Prisma-ийн датаг цэвэрлэж явуулах
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Firebase update error:", err);
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // ... (Admin шалгах хэсэг хэвээрээ үлдэнэ) ...
    const { id } = await params;

    // 1. Prisma-аас устгах
    await prisma.order.delete({
      where: { id: parseInt(id) },
    });

    // 2. Firebase-аас устгах (Admin-ы дэлгэц дээрээс алга болно)
    try {
      await deleteDoc(doc(db, "orders", id));
    } catch (err) {
      console.error("Firebase delete error:", err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 },
    );
  }
}
