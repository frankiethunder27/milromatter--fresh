import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { likes } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

// POST /api/posts/[id]/like - Like a post
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: postId } = await params;

  try {
    await db
      .insert(likes)
      .values({ userId: session.user.id, postId })
      .onConflictDoNothing();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error liking post:", error);
    return NextResponse.json({ error: "Failed to like post" }, { status: 500 });
  }
}

// DELETE /api/posts/[id]/like - Unlike a post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: postId } = await params;

  try {
    await db
      .delete(likes)
      .where(and(eq(likes.userId, session.user.id), eq(likes.postId, postId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unliking post:", error);
    return NextResponse.json({ error: "Failed to unlike post" }, { status: 500 });
  }
}

