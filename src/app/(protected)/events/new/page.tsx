import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Box from "@mui/material/Box";
import { getDb } from "@/lib/prisma";
import EventForm from "@/components/EventForm";
import { sendEventInvitationEmail } from "@/lib/email";

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

    const invitedUsers = await prisma.user.findMany({
      where: { id: { in: data.participantIds } },
      select: { id: true, email: true, name: true },
    });

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

    const eventDate = new Date(data.datetime).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    await Promise.all(
      invitedUsers.map((user) =>
        sendEventInvitationEmail({
          email: user.email,
          inviteeName: user.name,
          organizerName: currentSession.user.name,
          eventTitle: data.title,
          eventDate,
          eventPlace: `${data.placeName}, ${data.placeAddress}`,
          eventsUrl: `${baseUrl}/events`,
        })
      )
    );

    revalidatePath("/events");
    redirect("/events");
  }

  return (
    <Box sx={{ p: 3 }}>
      <EventForm availableUsers={availableUsers} onCreate={createEvent} />
    </Box>
  );
}
