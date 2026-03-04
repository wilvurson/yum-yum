import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

type LeaderboardUser = {
  id: number;
  name: string | null;
  email: string | null;
  points: number;
  streak: number;
};

// GET - Get leaderboard sorted by points
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : undefined;

    // Get all users sorted by points (descending)
    const leaderboard = await prisma.user.findMany({
      take: limit,
      orderBy: {
        points: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        streak: true,
      },
    });

    // Add rank to each user
    const rankedLeaderboard = leaderboard.map(
      (user: LeaderboardUser, index: number) => ({
        ...user,
        rank: index + 1,
      }),
    );

    return NextResponse.json(rankedLeaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 },
    );
  }
}
