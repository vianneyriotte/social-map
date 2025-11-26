"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { divIcon, LatLngExpression } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

interface UserLocation {
  id: string;
  name: string;
  avatarUrl?: string | null;
  latitude: number;
  longitude: number;
}

interface MapProps {
  center: LatLngExpression;
  zoom?: number;
  users: UserLocation[];
}

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

function AvatarMarkerIcon({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string | null;
}) {
  const bgColor = stringToColor(name);
  const initials = getInitials(name);

  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        backgroundColor: avatarUrl ? "transparent" : bgColor,
        border: "3px solid white",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span
          style={{
            color: "white",
            fontSize: 14,
            fontWeight: "bold",
          }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

function UserMarker({ user }: { user: UserLocation }) {
  const icon = divIcon({
    html: renderToStaticMarkup(
      <AvatarMarkerIcon name={user.name} avatarUrl={user.avatarUrl} />
    ),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
    className: "user-marker-icon",
  });

  return (
    <Marker position={[user.latitude, user.longitude]} icon={icon}>
      <Popup>
        <strong>{user.name}</strong>
      </Popup>
    </Marker>
  );
}

export default function Map({ center, zoom = 6, users }: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {users.map((user) => (
        <UserMarker key={user.id} user={user} />
      ))}
    </MapContainer>
  );
}
