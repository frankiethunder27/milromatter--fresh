import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
import { posts, likes, comments, users, hashtags, postHashtags } from "@/lib/db/schema";
import { desc, eq, sql, and } from "drizzle-orm";
import { z } from "zod";

const createPostSchema = z.object({
  content: z.string().min(1, "Post cannot be empty").max(1000, "Post must be under 1000 characters"),
});

// GET /api/posts - Get all posts
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allPosts = await db
    .select({
      id: posts.id,
      content: posts.content,
      createdAt: posts.createdAt,
      userId: posts.userId,
      author: {
        id: users.id,
        name: users.name,
        image: users.image,
      },
      likesCount: sql<number>`(SELECT COUNT(*) FROM likes WHERE likes.post_id = ${posts.id})`,
      commentsCount: sql<number>`(SELECT COUNT(*) FROM comments WHERE comments.post_id = ${posts.id})`,
      isLiked: sql<boolean>`EXISTS(SELECT 1 FROM likes WHERE likes.post_id = ${posts.id} AND likes.user_id = ${session.user.id})`,
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt))
    .limit(50);

  return NextResponse.json(allPosts);
}

// POST /api/posts - Create a post
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { content } = createPostSchema.parse(body);

    // Create the post
    const [newPost] = await db
      .insert(posts)
      .values({
        userId: session.user.id,
        content,
      })
      .returning();

    // Extract and save hashtags
    const hashtagMatches = content.match(/#(\w+)/g);
    if (hashtagMatches) {
      const uniqueTags = [...new Set(hashtagMatches.map(tag => tag.slice(1).toLowerCase()))];
      
      for (const tagName of uniqueTags) {
        // Upsert hashtag
        const [hashtag] = await db
          .insert(hashtags)
          .values({ name: tagName })
          .onConflictDoNothing()
          .returning();
        
        const existingTag = hashtag || (await db.select().from(hashtags).where(eq(hashtags.name, tagName)))[0];
        
        if (existingTag) {
          await db
            .insert(postHashtags)
            .values({ postId: newPost.id, hashtagId: existingTag.id })
            .onConflictDoNothing();
        }
      }
    }

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

