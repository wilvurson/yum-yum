import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: Request) {
  try {
    // Check if this is a server-side request (no URL needed)
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    // If email query param is provided, do a direct lookup (for client-side)
    if (email) {
      let dbUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // If user doesn't have a username, set it from email
      if (!dbUser.username) {
        const username = email.split("@")[0];
        dbUser = await prisma.user.update({
          where: { email },
          data: { username },
        });
      }

      return NextResponse.json(dbUser);
    }

    // Otherwise, use Clerk authentication (for server-side)
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    let dbUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in DB" },
        { status: 404 },
      );
    }

    // If user doesn't have a username, set it from email
    if (!dbUser.username) {
      const username = userEmail.split("@")[0];
      dbUser = await prisma.user.update({
        where: { email: userEmail },
        data: { username },
      });
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
    // Generate username from email (part before @)
    const username = email.split("@")[0];

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    // Upsert user
    const dbUser = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: { email, name, username },
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

export async function PUT(request: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Display name is required" },
        { status: 400 },
      );
    }

    // Update user's display name
    const dbUser = await prisma.user.update({
      where: { email },
      data: { name },
    });

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
