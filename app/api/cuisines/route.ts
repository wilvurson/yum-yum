import { prisma } from "../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cuisines = await prisma.cuisine.findMany({
      select: {
        name: true,
      },
    });

    return NextResponse.json(cuisines.map((c) => c.name));
  } catch (error) {
    console.error("Error fetching cuisines:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
