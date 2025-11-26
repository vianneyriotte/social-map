import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import prisma from "@/lib/prisma";
import ProfileForm from "@/components/ProfileForm";
import { revalidatePath } from "next/cache";

async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      workAddress: true,
      workLatitude: true,
      workLongitude: true,
      avatarUrl: true,
    },
  });

  return user;
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const user = await getUser(session.user.id);

  if (!user) {
    redirect("/login");
  }

  async function saveProfile(data: {
    name: string;
    workAddress: string;
    workLatitude: number;
    workLongitude: number;
    avatarUrl?: string;
  }) {
    "use server";

    const currentSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!currentSession) {
      throw new Error("Non autorisé");
    }

    await prisma.user.update({
      where: { id: currentSession.user.id },
      data: {
        name: data.name,
        workAddress: data.workAddress,
        workLatitude: data.workLatitude,
        workLongitude: data.workLongitude,
        avatarUrl: data.avatarUrl || null,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/map");
  }

  return (
    <Box sx={{ p: 3 }}>
      <ProfileForm user={user} onSave={saveProfile} />
    </Box>
  );
}
