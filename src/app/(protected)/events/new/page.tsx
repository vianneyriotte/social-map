import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Box from "@mui/material/Box";
import { getDb } from "@/lib/prisma";
import EventForm from "@/components/EventForm";

async function getAvailableUsers(currentUserId: string) {
  const prisma = getDb();
  const users = await prisma.user.findMany({
    where: {
      id: { not: currentUserId },
    },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
    orderBy: { name: "asc" },
  });

  return users;
}

export default async function NewEventPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const availableUsers = await getAvailableUsers(session.user.id);

  async function createEvent(data: {
    title: string;
    description: string;
    datetime: string;
    placeName: string;
    placeAddress: string;
    placeLatitude: number;
    placeLongitude: number;
    participantIds: string[];
  }) {
    "use server";

    const currentSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!currentSession) {
      throw new Error("Non autorisé");
    }

    const prisma = getDb();
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description || null,
        datetime: new Date(data.datetime),
        placeName: data.placeName,
        placeAddress: data.placeAddress,
        placeLatitude: data.placeLatitude,
        placeLongitude: data.placeLongitude,
        createdById: currentSession.user.id,
        participants: {
          create: data.participantIds.map((userId) => ({
            userId,
            status: "invited",
          })),
        },
      },
    });

    revalidatePath("/events");
    redirect("/events");
  }

  return (
    <Box sx={{ p: 3 }}>
      <EventForm availableUsers={availableUsers} onCreate={createEvent} />
    </Box>
  );
}
