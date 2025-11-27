import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import Link from "next/link";
import { getDb } from "@/lib/prisma";
import EventList from "@/components/EventList";

async function getEvents(userId: string) {
  const prisma = getDb();
  const createdEvents = await prisma.event.findMany({
    where: { createdById: userId },
    include: {
      creator: {
        select: { id: true, name: true, avatarUrl: true },
      },
      participants: {
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
    },
    orderBy: { datetime: "asc" },
  });

  const invitedEvents = await prisma.event.findMany({
    where: {
      participants: {
        some: { userId },
      },
      createdById: { not: userId },
    },
    include: {
      creator: {
        select: { id: true, name: true, avatarUrl: true },
      },
      participants: {
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
    },
    orderBy: { datetime: "asc" },
  });

  return { createdEvents, invitedEvents };
}

export default async function EventsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { createdEvents, invitedEvents } = await getEvents(session.user.id);

  async function updateParticipantStatus(eventId: string, status: string) {
    "use server";

    const currentSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!currentSession) {
      throw new Error("Non autorisé");
    }

    const prisma = getDb();
    await prisma.eventParticipant.updateMany({
      where: {
        eventId,
        userId: currentSession.user.id,
      },
      data: { status },
    });

    revalidatePath("/events");
  }

  async function deleteEvent(eventId: string) {
    "use server";

    const currentSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!currentSession) {
      throw new Error("Non autorisé");
    }

    const prisma = getDb();
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.createdById !== currentSession.user.id) {
      throw new Error("Non autorisé");
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    revalidatePath("/events");
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5">Événements</Typography>
        <Link href="/events/new" style={{ textDecoration: "none" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
          >
            Créer un événement
          </Button>
        </Link>
      </Box>

      <EventList
        createdEvents={createdEvents}
        invitedEvents={invitedEvents}
        currentUserId={session.user.id}
        onUpdateStatus={updateParticipantStatus}
        onDeleteEvent={deleteEvent}
      />
    </Box>
  );
}
