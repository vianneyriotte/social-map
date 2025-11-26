import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AppDrawer from "@/components/AppDrawer";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    avatarUrl: (session.user as { avatarUrl?: string }).avatarUrl || null,
  };

  return <AppDrawer user={user}>{children}</AppDrawer>;
}
