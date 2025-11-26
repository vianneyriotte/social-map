export interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
  place_id: string;
}

export async function geocodeAddress(
  address: string
): Promise<GeocodingResult[]> {
  const params = new URLSearchParams({
    q: address,
    format: "json",
    addressdetails: "1",
    limit: "5",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      headers: {
        "User-Agent": "SocialMap/1.0",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.statusText}`);
  }

  return response.json();
}
