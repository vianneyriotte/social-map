"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UserAvatar from "./UserAvatar";
import { geocodeAddress, GeocodingResult } from "@/lib/geocoding";

interface User {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface EventFormProps {
  availableUsers: User[];
  onCreate: (data: {
    title: string;
    description: string;
    datetime: string;
    placeName: string;
    placeAddress: string;
    placeLatitude: number;
    placeLongitude: number;
    participantIds: string[];
  }) => Promise<void>;
}

export default function EventForm({ availableUsers, onCreate }: EventFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [datetime, setDatetime] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [placeAddress, setPlaceAddress] = useState("");
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSearchAddress = async () => {
    if (!placeAddress.trim()) return;

    setSearching(true);
    setError("");
    try {
      const results = await geocodeAddress(placeAddress);
      setSearchResults(results);
      if (results.length === 0) {
        setError("Aucune adresse trouvée");
      }
    } catch {
      setError("Erreur lors de la recherche d'adresse");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectAddress = (result: GeocodingResult) => {
    setPlaceAddress(result.display_name);
    setSelectedCoords({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    });
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Veuillez saisir un titre");
      return;
    }

    if (!datetime) {
      setError("Veuillez sélectionner une date et heure");
      return;
    }

    if (!selectedCoords) {
      setError("Veuillez sélectionner une adresse valide");
      return;
    }

    if (selectedUsers.length === 0) {
      setError("Veuillez sélectionner au moins un participant");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onCreate({
        title: title.trim(),
        description: description.trim(),
        datetime,
        placeName: placeName.trim() || placeAddress.split(",")[0],
        placeAddress,
        placeLatitude: selectedCoords.lat,
        placeLongitude: selectedCoords.lng,
        participantIds: selectedUsers.map((u) => u.id),
      });
    } catch {
      setError("Erreur lors de la création de l'événement");
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/events")}
        >
          Retour
        </Button>
        <Typography variant="h5">Créer un événement</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Titre de l'événement"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
          required
          placeholder="Apéro, Dîner, Réunion..."
        />

        <TextField
          fullWidth
          label="Description (optionnel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2 }}
          multiline
          rows={3}
          placeholder="Détails supplémentaires..."
        />

        <TextField
          fullWidth
          label="Date et heure"
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          sx={{ mb: 2 }}
          required
          slotProps={{
            inputLabel: { shrink: true },
          }}
        />

        <TextField
          fullWidth
          label="Nom du lieu (optionnel)"
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
          sx={{ mb: 2 }}
          placeholder="Le Petit Bistrot, Chez Paul..."
        />

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              label="Adresse du lieu"
              value={placeAddress}
              onChange={(e) => {
                setPlaceAddress(e.target.value);
                setSelectedCoords(null);
              }}
              placeholder="123 Rue Example, 75001 Paris"
              required
            />
            <Button
              variant="outlined"
              onClick={handleSearchAddress}
              disabled={searching || !placeAddress.trim()}
            >
              {searching ? <CircularProgress size={24} /> : "Rechercher"}
            </Button>
          </Box>

          {searchResults.length > 0 && (
            <Paper variant="outlined" sx={{ mt: 1, maxHeight: 200, overflow: "auto" }}>
              <List dense>
                {searchResults.map((result) => (
                  <ListItem key={result.place_id} disablePadding>
                    <ListItemButton onClick={() => handleSelectAddress(result)}>
                      <ListItemText
                        primary={result.display_name}
                        primaryTypographyProps={{ noWrap: true }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {selectedCoords && (
            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
              Coordonnées: {selectedCoords.lat.toFixed(4)},{" "}
              {selectedCoords.lng.toFixed(4)}
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Autocomplete
            multiple
            options={availableUsers}
            value={selectedUsers}
            onChange={(_, newValue) => setSelectedUsers(newValue)}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Participants"
                placeholder="Sélectionnez les participants..."
              />
            )}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              return (
                <Box
                  component="li"
                  key={key}
                  {...otherProps}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <UserAvatar
                    name={option.name}
                    avatarUrl={option.avatarUrl}
                    size={32}
                  />
                  {option.name}
                </Box>
              );
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    {...tagProps}
                    avatar={
                      <UserAvatar
                        name={option.name}
                        avatarUrl={option.avatarUrl}
                        size={24}
                      />
                    }
                    label={option.name}
                  />
                );
              })
            }
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={saving}
          size="large"
        >
          {saving ? <CircularProgress size={24} /> : "Créer l'événement"}
        </Button>
      </Box>
    </Paper>
  );
}
