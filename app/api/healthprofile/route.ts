import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Get the current authenticated user from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    // Find the user in the database
    const dbUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the user's health profile
    const healthProfile = await prisma.userHealthProfile.findUnique({
      where: { userId: dbUser.id },
    });

    if (!healthProfile) {
      return NextResponse.json(
        { error: "Health profile not found" },
        { status: 404 },
      );
    }

    // Get or create today's daily intake
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyIntake = await prisma.dailyIntake.findUnique({
      where: {
        userId_date: {
          userId: dbUser.id,
          date: today,
        },
      },
    });

    if (!dailyIntake) {
      // Create new daily intake for today
      dailyIntake = await prisma.dailyIntake.create({
        data: {
          userId: dbUser.id,
          date: today,
        },
      });
    } else {
      // Check if the date is not today, if so, reset
      const intakeDate = new Date(dailyIntake.date);
      intakeDate.setHours(0, 0, 0, 0);
      if (intakeDate.getTime() !== today.getTime()) {
        dailyIntake = await prisma.dailyIntake.update({
          where: {
            userId_date: {
              userId: dbUser.id,
              date: today,
            },
          },
          data: {
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
            water: 0,
          },
        });
      }
    }

    return NextResponse.json({
      ...healthProfile,
      dailyIntake,
    });
  } catch (error) {
    console.error("Error fetching health profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch health profile" },
      { status: 500 },
    );
  }
}

// PUT method to update daily intake (add consumed calories/nutrients)
export async function PUT(request: NextRequest) {
  try {
    // Get the current authenticated user from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    // Find the user in the database
    const dbUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { calories, protein, fat, carbs, water } = body;

    // Validate input
    if (
      typeof calories !== "number" ||
      typeof protein !== "number" ||
      typeof fat !== "number" ||
      typeof carbs !== "number" ||
      (water !== undefined && typeof water !== "number")
    ) {
      return NextResponse.json(
        { error: "Invalid input data. All values must be numbers." },
        { status: 400 },
      );
    }

    // Get or create today's daily intake
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyIntake = await prisma.dailyIntake.findUnique({
      where: {
        userId_date: {
          userId: dbUser.id,
          date: today,
        },
      },
    });

    if (!dailyIntake) {
      // Create new daily intake for today with the consumed values
      dailyIntake = await prisma.dailyIntake.create({
        data: {
          userId: dbUser.id,
          date: today,
          calories: Math.max(0, calories),
          protein: Math.max(0, protein),
          fat: Math.max(0, fat),
          carbs: Math.max(0, carbs),
          water: water !== undefined ? Math.max(0, water) : 0,
        },
      });
    } else {
      // Update existing daily intake by adding the new values
      dailyIntake = await prisma.dailyIntake.update({
        where: {
          userId_date: {
            userId: dbUser.id,
            date: today,
          },
        },
        data: {
          calories: { increment: Math.max(0, calories) },
          protein: { increment: Math.max(0, protein) },
          fat: { increment: Math.max(0, fat) },
          carbs: { increment: Math.max(0, carbs) },
          water:
            water !== undefined ? { increment: Math.max(0, water) } : undefined,
        },
      });
    }

    return NextResponse.json({
      success: true,
      dailyIntake,
    });
  } catch (error) {
    console.error("Error updating daily intake:", error);
    return NextResponse.json(
      { error: "Failed to update daily intake" },
      { status: 500 },
    );
  }
}
