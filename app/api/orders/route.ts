import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { OrderStatus } from "@prisma/client";
import { db } from "@/lib/firebase"; // Firebase-ээ импортлох
import { doc, setDoc } from "firebase/firestore";

export async function GET() {
  // GET хэсэг хэвээрээ үлдэнэ (Энэ нь эхний удаа дата ачаалахад хэрэгтэй)
  // ... (таны өмнөх GET код)
}

export async function POST(request: NextRequest) {
  try {
    const { userId, items, status, totalPrice, deliveryType, deliveryAddress } =
      await request.json();

    let orderItems = items;
    if (typeof items === "string") {
      try {
        orderItems = JSON.parse(items);
      } catch {
        orderItems = [];
      }
    }

    const orderStatus = status
      ? (status.toUpperCase() as OrderStatus)
      : OrderStatus.PENDING;

    // 1. Prisma-аар PostgreSQL-д захиалга үүсгэх
    const order = await prisma.order.create({
      data: {
        userId,
        status: orderStatus,
        totalPrice: totalPrice || 0,
        deliveryType: deliveryType || "pickup",
        deliveryAddress: deliveryAddress || null,
      },
    });

    // 2. Order Items үүсгэх
    if (orderItems && Array.isArray(orderItems) && orderItems.length > 0) {
      await prisma.orderItem.createMany({
        data: orderItems.map((item: any) => ({
          orderId: order.id,
          foodId: item.id || null,
          groceryItemId: null,
          quantity: item.quantity,
          price:
            typeof item.price === "string"
              ? parseInt(item.price, 10)
              : Math.round(item.price),
        })),
      });
    }

    // 3. Бүх мэдээллийг багтаасан захиалгыг буцааж авах
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: { food: true, groceryItem: true },
        },
        user: true,
      },
    });

    // 4. FIREBASE-РҮҮ БИЧИХ (Socket.io-г орлох хэсэг)
    if (completeOrder) {
      try {
        // Firebase Firestore-д 'orders' collection дотор Order ID-гаар нь хадгална
        await setDoc(doc(db, "orders", completeOrder.id.toString()), {
          ...JSON.parse(JSON.stringify(completeOrder)), // Prisma объект-ыг цэвэр JSON болгох
          firebaseTimestamp: new Date().toISOString(), // Real-time эрэмбэлэхэд хэрэгтэй
        });
      } catch (firebaseErr) {
        console.error("Firebase Sync Error:", firebaseErr);
        // Firebase алдаа гарсан ч үндсэн захиалга PostgreSQL-д хадгалагдсан тул зогсоохгүй
      }
    }

    // 5. Update daily intake with calories and macros from ordered items
    if (completeOrder && completeOrder.items) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate totals from food items
      let totalCalories = 0;
      let totalProtein = 0;
      let totalFat = 0;
      let totalCarbs = 0;
      for (const item of completeOrder.items) {
        if (item.food) {
          totalCalories += item.food.calories * item.quantity;
          totalProtein += item.food.protein * item.quantity;
          totalFat += item.food.fat * item.quantity;
          totalCarbs += item.food.carbs * item.quantity;
        }
      }

      if (
        totalCalories > 0 ||
        totalProtein > 0 ||
        totalFat > 0 ||
        totalCarbs > 0
      ) {
        // Get or create today's daily intake
        let dailyIntake = await prisma.dailyIntake.findUnique({
          where: {
            userId_date: {
              userId: completeOrder.userId,
              date: today,
            },
          },
        });

        if (!dailyIntake) {
          dailyIntake = await prisma.dailyIntake.create({
            data: {
              userId: completeOrder.userId,
              date: today,
              calories: totalCalories,
              protein: totalProtein,
              fat: totalFat,
              carbs: totalCarbs,
            },
          });
        } else {
          // Update existing daily intake
          dailyIntake = await prisma.dailyIntake.update({
            where: {
              userId_date: {
                userId: completeOrder.userId,
                date: today,
              },
            },
            data: {
              calories: dailyIntake.calories + totalCalories,
              protein: dailyIntake.protein + totalProtein,
              fat: dailyIntake.fat + totalFat,
              carbs: dailyIntake.carbs + totalCarbs,
            },
          });
        }
      }
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
