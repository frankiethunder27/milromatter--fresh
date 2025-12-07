"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PostComposerProps {
  user: {
    name?: string | null;
    image?: string | null;
  };
}

export function PostComposer({ user }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const router = useRouter();
  const charLimit = 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPosting) return;

    setIsPosting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (res.ok) {
        setContent("");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const charsLeft = charLimit - content.length;
  const isOverLimit = charsLeft < 0;

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-4 rounded-xl bg-slate-900 border border-slate-800">
      <div className="flex gap-3">
        {user.image && (
          <img
            src={user.image}
            alt={user.name || "You"}
            className="w-10 h-10 rounded-full"
          />
        )}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-transparent text-white placeholder:text-slate-500 resize-none outline-none min-h-[100px]"
            maxLength={charLimit + 100}
          />
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className={`text-sm ${isOverLimit ? "text-red-400" : charsLeft < 100 ? "text-amber-400" : "text-slate-500"}`}>
              {charsLeft} characters left
            </span>
            <button
              type="submit"
              disabled={!content.trim() || isOverLimit || isPosting}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-full font-medium transition"
            >
              {isPosting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

