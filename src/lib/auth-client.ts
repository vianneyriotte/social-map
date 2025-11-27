"use client";

import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Debug: affiche l'URL utilisée (à supprimer après debug)
if (typeof window !== "undefined") {
  console.log("[Auth] baseURL:", baseURL);
}

export const authClient = createAuthClient({
  baseURL,
  plugins: [magicLinkClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
