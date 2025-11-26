import prisma from "@/lib/prisma";
import MapWrapper from "@/components/MapWrapper";

async function getUsers() {
  const users = await prisma.user.findMany({
    where: {
      workLatitude: { not: null },
      workLongitude: { not: null },
      showOnMap: true,
    },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      workLatitude: true,
      workLongitude: true,
    },
  });

  return users
    .filter((u) => u.workLatitude !== null && u.workLongitude !== null)
    .map((u) => ({
      id: u.id,
      name: u.name,
      avatarUrl: u.avatarUrl,
      latitude: u.workLatitude!,
      longitude: u.workLongitude!,
    }));
}

export default async function MapPage() {
  const users = await getUsers();

  const center: [number, number] = [46.603354, 1.888334];

  return <MapWrapper center={center} zoom={6} users={users} />;
}
