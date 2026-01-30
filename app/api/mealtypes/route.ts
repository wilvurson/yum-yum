import { prisma } from "../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const mealTypes = await prisma.mealType.findMany({
      select: {
        name: true,
      },
    });

    return NextResponse.json(mealTypes.map((mt) => mt.name));
  } catch (error) {
    console.error("Error fetching meal types:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
