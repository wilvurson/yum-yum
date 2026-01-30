import { prisma } from "../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const groceryItems = await prisma.groceryItem.findMany();

    return NextResponse.json(groceryItems);
  } catch (error) {
    console.error("Error fetching grocery items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
