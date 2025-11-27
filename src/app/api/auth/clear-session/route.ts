import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  for (const cookie of allCookies) {
    if (cookie.name.startsWith("better-auth")) {
      cookieStore.delete(cookie.name);
    }
  }

  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}
