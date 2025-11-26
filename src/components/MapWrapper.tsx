"use client";

import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Typography>Chargement de la carte...</Typography>
    </Box>
  ),
});

interface UserLocation {
  id: string;
  name: string;
  avatarUrl?: string | null;
  latitude: number;
  longitude: number;
}

interface MapWrapperProps {
  center: [number, number];
  zoom?: number;
  users: UserLocation[];
}

export default function MapWrapper({ center, zoom, users }: MapWrapperProps) {
  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <Map center={center} zoom={zoom} users={users} />
    </Box>
  );
}
