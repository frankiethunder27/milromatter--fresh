"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
    >
      Sign out
    </button>
  );
}

