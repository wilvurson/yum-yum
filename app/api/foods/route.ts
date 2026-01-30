import { prisma } from "../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mealTypeName = searchParams.get("mealType");
  const cuisineName = searchParams.get("cuisine");

  if (!mealTypeName && !cuisineName) {
    return NextResponse.json(
      { error: "mealType or cuisine query parameter is required" },
      { status: 400 },
    );
  }

  try {
    const whereClause: any = {};
    if (mealTypeName) {
      whereClause.mealType = { name: mealTypeName };
    }
    if (cuisineName) {
      whereClause.cuisine = { name: cuisineName };
    }

    const foods = await prisma.food.findMany({
      where: whereClause,
      include: {
        mealType: true,
        cuisine: true,
      },
    });

    return NextResponse.json(foods);
  } catch (error) {
    console.error("Error fetching foods:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
