"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      name: string | null;
      image: string | null;
    };
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
  };
  currentUserId: string;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const router = useRouter();

  const handleLike = async () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    try {
      await fetch(`/api/posts/${post.id}/like`, {
        method: newIsLiked ? "POST" : "DELETE",
      });
    } catch (error) {
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikesCount((prev) => (newIsLiked ? prev - 1 : prev + 1));
    }
  };

  // Parse hashtags and make them clickable
  const renderContent = (text: string) => {
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("#")) {
        return (
          <span
            key={i}
            className="text-purple-400 hover:text-purple-300 cursor-pointer"
            onClick={() => router.push(`/hashtag/${part.slice(1)}`)}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <article className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
      {/* Author */}
      <div className="flex items-center gap-3 mb-3">
        {post.author.image && (
          <img
            src={post.author.image}
            alt={post.author.name || "User"}
            className="w-10 h-10 rounded-full"
          />
        )}
        <div>
          <div className="font-medium text-white">{post.author.name}</div>
          <div className="text-sm text-slate-500">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="text-slate-200 whitespace-pre-wrap mb-4">
        {renderContent(post.content)}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 pt-3 border-t border-slate-800">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition ${
            isLiked ? "text-pink-500" : "text-slate-500 hover:text-pink-500"
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          <span className="text-sm">{likesCount}</span>
        </button>

        <button className="flex items-center gap-2 text-slate-500 hover:text-purple-400 transition">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">{post.commentsCount}</span>
        </button>
      </div>
    </article>
  );
}

