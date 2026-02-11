import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { status } = await request.json();
    const { id } = await params;
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
    });
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
    const { id } = await params;
    const orderId = parseInt(id);

    // First, delete all related order items
    await prisma.orderItem.deleteMany({
      where: { orderId },
    });

    // Then delete the order
    await prisma.order.delete({
      where: { id: orderId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 },
    );
  }
}
