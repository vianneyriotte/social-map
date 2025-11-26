"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import EventCard from "./EventCard";

interface User {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface Participant {
  id: string;
  userId: string;
  status: string;
  user: User;
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  datetime: Date;
  placeName: string;
  placeAddress: string;
  placeLatitude: number;
  placeLongitude: number;
  createdById: string;
  creator: User;
  participants: Participant[];
}

interface EventListProps {
  createdEvents: Event[];
  invitedEvents: Event[];
  currentUserId: string;
  onUpdateStatus: (eventId: string, status: string) => Promise<void>;
  onDeleteEvent: (eventId: string) => Promise<void>;
}

export default function EventList({
  createdEvents,
  invitedEvents,
  currentUserId,
  onUpdateStatus,
  onDeleteEvent,
}: EventListProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleStatusUpdate = async (eventId: string, status: string) => {
    setLoading(eventId);
    setError("");
    try {
      await onUpdateStatus(eventId, status);
    } catch {
      setError("Erreur lors de la mise à jour du statut");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (eventId: string) => {
    setLoading(eventId);
    setError("");
    try {
      await onDeleteEvent(eventId);
    } catch {
      setError("Erreur lors de la suppression de l'événement");
    } finally {
      setLoading(null);
    }
  };

  const hasNoEvents = createdEvents.length === 0 && invitedEvents.length === 0;

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {hasNoEvents && (
        <Alert severity="info">
          Aucun événement pour le moment. Créez-en un pour inviter vos amis !
        </Alert>
      )}

      {createdEvents.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Mes événements
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {createdEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isCreator={true}
                loading={loading === event.id}
                onDelete={() => handleDelete(event.id)}
              />
            ))}
          </Box>
        </Box>
      )}

      {invitedEvents.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Invitations reçues
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {invitedEvents.map((event) => {
              const participation = event.participants.find(
                (p) => p.userId === currentUserId
              );
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  isCreator={false}
                  participationStatus={participation?.status}
                  loading={loading === event.id}
                  onAccept={() => handleStatusUpdate(event.id, "accepted")}
                  onDecline={() => handleStatusUpdate(event.id, "declined")}
                />
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
}
