import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// PATCH - Accept or reject friend request
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    const { status } = await request.json();

    if (!status || !["accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'accepted' or 'rejected'" },
        { status: 400 },
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const friendshipId = parseInt(params.id);

    // Find the friendship request
    const friendship = await prisma.friendship.findFirst({
      where: {
        id: friendshipId,
        receiverId: dbUser.id,
        status: "pending",
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: "Friend request not found" },
        { status: 404 },
      );
    }

    // Update friendship status
    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status },
    });

    return NextResponse.json(updatedFriendship);
  } catch (error) {
    console.error("Error updating friend request:", error);
    return NextResponse.json(
      { error: "Failed to update friend request" },
      { status: 500 },
    );
  }
}

// DELETE - Remove friend
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const friendId = parseInt(params.id);

    // Find and delete the friendship
    const friendship = await prisma.friendship.findFirst({
      where: {
        id: friendId,
        OR: [{ senderId: dbUser.id }, { receiverId: dbUser.id }],
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: "Friendship not found" },
        { status: 404 },
      );
    }

    await prisma.friendship.delete({
      where: { id: friendId },
    });

    return NextResponse.json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error removing friend:", error);
    return NextResponse.json(
      { error: "Failed to remove friend" },
      { status: 500 },
    );
  }
}
