"use client";

import Avatar from "@mui/material/Avatar";

function stringToColor(string: string) {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}

export default function UserAvatar({
  name,
  avatarUrl,
  size = 40,
}: UserAvatarProps) {
  if (avatarUrl) {
    return (
      <Avatar
        src={avatarUrl}
        alt={name}
        sx={{ width: size, height: size }}
      />
    );
  }

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: stringToColor(name),
        fontSize: size * 0.4,
      }}
    >
      {getInitials(name)}
    </Avatar>
  );
}
