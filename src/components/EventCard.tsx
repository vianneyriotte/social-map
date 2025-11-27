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
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AppleIcon from "@mui/icons-material/Apple";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import UserAvatar from "./UserAvatar";
import { useState } from "react";

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

function formatDateForGoogle(date: Date): string {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function formatDateForICS(date: Date): string {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function generateGoogleCalendarUrl(event: Event): string {
  const start = formatDateForGoogle(event.datetime);
  const endDate = new Date(event.datetime);
  endDate.setHours(endDate.getHours() + 2);
  const end = formatDateForGoogle(endDate);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    location: `${event.placeName}, ${event.placeAddress}`,
    details: event.description || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function generateICSContent(event: Event): string {
  const start = formatDateForICS(event.datetime);
  const endDate = new Date(event.datetime);
  endDate.setHours(endDate.getHours() + 2);
  const end = formatDateForICS(endDate);
  const now = formatDateForICS(new Date());

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Social Map//Event//FR
BEGIN:VEVENT
UID:${event.id}@socialmap
DTSTAMP:${now}
DTSTART:${start}
DTEND:${end}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ""}
LOCATION:${event.placeName}, ${event.placeAddress}
GEO:${event.placeLatitude};${event.placeLongitude}
END:VEVENT
END:VCALENDAR`;
}

function downloadICS(event: Event) {
  const content = generateICSContent(event);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
  const [calendarAnchor, setCalendarAnchor] = useState<null | HTMLElement>(null);

  const acceptedParticipants = event.participants.filter(
    (p) => p.status === "accepted"
  );
  const pendingParticipants = event.participants.filter(
    (p) => p.status === "invited"
  );

  const handleCalendarClick = (e: React.MouseEvent<HTMLElement>) => {
    setCalendarAnchor(e.currentTarget);
  };

  const handleCalendarClose = () => {
    setCalendarAnchor(null);
  };

  const handleGoogleCalendar = () => {
    window.open(generateGoogleCalendarUrl(event), "_blank");
    handleCalendarClose();
  };

  const handleAppleCalendar = () => {
    downloadICS(event);
    handleCalendarClose();
  };

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
            <Typography variant="body2" sx={{ flex: 1 }}>
              {formatDateTime(event.datetime)}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CalendarMonthIcon />}
              onClick={handleCalendarClick}
              sx={{ ml: 1 }}
            >
              Ajouter
            </Button>
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

      <Menu
        anchorEl={calendarAnchor}
        open={Boolean(calendarAnchor)}
        onClose={handleCalendarClose}
      >
        <MenuItem onClick={handleGoogleCalendar}>
          <ListItemIcon>
            <CalendarMonthIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Google Agenda</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAppleCalendar}>
          <ListItemIcon>
            <AppleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Apple Calendar / ICS</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
}
