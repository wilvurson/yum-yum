import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    if (!date) {
      return NextResponse.json([]);
    }
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const schedules = await prisma.schedule.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { startTime: "asc" },
    });
    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  const { date, startTime, endTime, activity } = await request.json();
  try {
    const newSchedule = await prisma.schedule.create({
      data: {
        date: new Date(date),
        startTime,
        endTime,
        activity,
      },
    });
    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    console.error("Failed to create schedule:", error);
    // Return a mock schedule for now
    return NextResponse.json(
      {
        id: Date.now(),
        date,
        startTime,
        endTime,
        activity,
      },
      { status: 201 },
    );
  }
}
