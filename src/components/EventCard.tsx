"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import AvatarGroup from "@mui/material/AvatarGroup";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import PlaceIcon from "@mui/icons-material/Place";
import EventIcon from "@mui/icons-material/Event";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import UserAvatar from "./UserAvatar";

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

interface EventCardProps {
  event: Event;
  isCreator: boolean;
  participationStatus?: string;
  loading?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onDelete?: () => void;
}

function formatDateTime(date: Date) {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status: string) {
  switch (status) {
    case "accepted":
      return "Accepté";
    case "declined":
      return "Refusé";
    case "invited":
    default:
      return "En attente";
  }
}

function getStatusColor(status: string): "success" | "error" | "warning" | "default" {
  switch (status) {
    case "accepted":
      return "success";
    case "declined":
      return "error";
    case "invited":
    default:
      return "warning";
  }
}

export default function EventCard({
  event,
  isCreator,
  participationStatus,
  loading,
  onAccept,
  onDecline,
  onDelete,
}: EventCardProps) {
  const acceptedParticipants = event.participants.filter(
    (p) => p.status === "accepted"
  );
  const pendingParticipants = event.participants.filter(
    (p) => p.status === "invited"
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            {event.title}
          </Typography>

          {event.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {event.description}
            </Typography>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <EventIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {formatDateTime(event.datetime)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <PlaceIcon fontSize="small" color="action" />
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {event.placeName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {event.placeAddress}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Organisé par
            </Typography>
            <UserAvatar
              name={event.creator.name}
              avatarUrl={event.creator.avatarUrl}
              size={24}
            />
            <Typography variant="body2">{event.creator.name}</Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Participants ({acceptedParticipants.length}/{event.participants.length})
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <AvatarGroup max={5}>
                {event.participants.map((p) => (
                  <UserAvatar
                    key={p.id}
                    name={p.user.name}
                    avatarUrl={p.user.avatarUrl}
                    size={32}
                  />
                ))}
              </AvatarGroup>
              {pendingParticipants.length > 0 && (
                <Chip
                  size="small"
                  label={`${pendingParticipants.length} en attente`}
                  color="warning"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          {!isCreator && participationStatus && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Chip
                label={getStatusLabel(participationStatus)}
                color={getStatusColor(participationStatus)}
                size="small"
              />
              {participationStatus === "invited" && (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={loading ? <CircularProgress size={16} /> : <CheckIcon />}
                    onClick={onAccept}
                    disabled={loading}
                  >
                    Accepter
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={loading ? <CircularProgress size={16} /> : <CloseIcon />}
                    onClick={onDecline}
                    disabled={loading}
                  >
                    Refuser
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {isCreator && onDelete && (
          <IconButton
            color="error"
            onClick={onDelete}
            disabled={loading}
            size="small"
          >
            {loading ? <CircularProgress size={20} /> : <DeleteIcon />}
          </IconButton>
        )}
      </Box>
    </Paper>
  );
}
