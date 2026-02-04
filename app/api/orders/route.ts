import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { OrderStatus } from "../../../lib/generated/prisma/enums";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!dbUser || !dbUser.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      include: {
        user: true,
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, items, status, totalPrice } = await request.json();

    // Convert status to uppercase and validate against OrderStatus enum
    const orderStatus = status
      ? (status.toUpperCase() as OrderStatus)
      : OrderStatus.PENDING;

    // Validate that the status is a valid OrderStatus
    if (status && !Object.values(OrderStatus).includes(orderStatus)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${Object.values(
            OrderStatus,
          ).join(", ")}`,
        },
        { status: 400 },
      );
    }

    // First create the order
    const order = await prisma.order.create({
      data: {
        userId,
        status: orderStatus,
        totalPrice: totalPrice || 0,
      },
    });

    // Then create order items if provided
    if (items && Array.isArray(items) && items.length > 0) {
      await prisma.orderItem.createMany({
        data: items.map((item: any) => ({
          orderId: order.id,
          foodId: item.foodId || null,
          groceryItemId: item.groceryItemId || null,
          quantity: item.quantity,
          price: item.price,
        })),
      });
    }

    // Fetch the complete order with items
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });

    return NextResponse.json(completeOrder, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
