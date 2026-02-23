import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    if (!dbUser || !dbUser.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { isAdmin } = await request.json();
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(params.id) },
      data: { isAdmin },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
