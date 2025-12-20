import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { PostComposer } from "@/components/post-composer";
import { Feed } from "@/components/feed";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            mikromatter
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-slate-300 text-sm">{session.user.name}</span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <PostComposer user={session.user} />
        <Feed userId={session.user.id!} />
      </div>
    </main>
  );
}

