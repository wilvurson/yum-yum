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
        items: {
          include: {
            food: true,
            groceryItem: true,
          },
        },
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

    // Parse items if it's a JSON string
    let orderItems = items;
    if (typeof items === "string") {
      try {
        orderItems = JSON.parse(items);
      } catch {
        orderItems = [];
      }
    }

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
    if (orderItems && Array.isArray(orderItems) && orderItems.length > 0) {
      await prisma.orderItem.createMany({
        data: orderItems.map((item: any) => ({
          orderId: order.id,
          foodId: item.id || null,
          groceryItemId: null, // Cart items are food items
          quantity: item.quantity,
          price:
            typeof item.price === "string"
              ? parseInt(item.price, 10)
              : Math.round(item.price),
        })),
      });
    }

    // Fetch the complete order with items
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true, user: true },
    });

    try {
      const io = (global as any).io;
      if (io) {
        io.to("admin-orders").emit("new-order", completeOrder);
      }
    } catch (err) {
      console.error("Socket emit error:", err);
    }

    return NextResponse.json(completeOrder, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
