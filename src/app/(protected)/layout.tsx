import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import AppDrawer from "@/components/AppDrawer";

async function hasAuthCookies(): Promise<boolean> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  return allCookies.some((cookie) => cookie.name.startsWith("better-auth"));
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const hasCookies = await hasAuthCookies();
    if (hasCookies) {
      redirect("/api/auth/clear-session");
    }
    redirect("/login");
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    avatarUrl: (session.user as { avatarUrl?: string }).avatarUrl || null,
  };

  return <AppDrawer user={user}>{children}</AppDrawer>;
}
