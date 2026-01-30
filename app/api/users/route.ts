import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

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

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in DB" },
        { status: 404 },
      );
    }

    // Always return current user now
    return NextResponse.json(dbUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    const name =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    // Upsert user
    const dbUser = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: { email, name },
    });

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error("Error ensuring user:", error);
    return NextResponse.json(
      { error: "Failed to ensure user" },
      { status: 500 },
    );
  }
}
