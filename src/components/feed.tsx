import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { PostCard } from "./post-card";

interface FeedProps {
  userId: string;
}

export async function Feed({ userId }: FeedProps) {
  const allPosts = await db
    .select({
      id: posts.id,
      content: posts.content,
      createdAt: posts.createdAt,
      userId: posts.userId,
      authorId: users.id,
      authorName: users.name,
      authorImage: users.image,
      likesCount: sql<number>`(SELECT COUNT(*)::int FROM likes WHERE likes.post_id = ${posts.id})`,
      commentsCount: sql<number>`(SELECT COUNT(*)::int FROM comments WHERE comments.post_id = ${posts.id})`,
      isLiked: sql<boolean>`EXISTS(SELECT 1 FROM likes WHERE likes.post_id = ${posts.id} AND likes.user_id = ${userId})`,
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt))
    .limit(50);

  if (allPosts.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-lg">No posts yet</p>
        <p className="text-sm">Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allPosts.map((post) => (
        <PostCard
          key={post.id}
          post={{
            id: post.id,
            content: post.content!,
            createdAt: post.createdAt!,
            author: {
              id: post.authorId!,
              name: post.authorName,
              image: post.authorImage,
            },
            likesCount: post.likesCount,
            commentsCount: post.commentsCount,
            isLiked: post.isLiked,
          }}
          currentUserId={userId}
        />
      ))}
    </div>
  );
}

