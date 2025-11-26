"use client";

import { useState, useRef } from "react";
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
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import UserAvatar from "./UserAvatar";
import { geocodeAddress, GeocodingResult } from "@/lib/geocoding";

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    workAddress?: string | null;
    workLatitude?: number | null;
    workLongitude?: number | null;
    avatarUrl?: string | null;
  };
  onSave: (data: {
    name: string;
    workAddress: string;
    workLatitude: number;
    workLongitude: number;
    avatarUrl?: string;
  }) => Promise<void>;
}

export default function ProfileForm({ user, onSave }: ProfileFormProps) {
  const [name, setName] = useState(user.name);
  const [workAddress, setWorkAddress] = useState(user.workAddress || "");
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(
    user.workLatitude && user.workLongitude
      ? { lat: user.workLatitude, lng: user.workLongitude }
      : null
  );
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || "");

  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearchAddress = async () => {
    if (!workAddress.trim()) return;

    setSearching(true);
    setError("");
    try {
      const results = await geocodeAddress(workAddress);
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
    setWorkAddress(result.display_name);
    setSelectedCoords({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    });
    setSearchResults([]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setAvatarPreview(dataUrl);
        setAvatarUrl(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCoords) {
      setError("Veuillez sélectionner une adresse valide");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      await onSave({
        name,
        workAddress,
        workLatitude: selectedCoords.lat,
        workLongitude: selectedCoords.lng,
        avatarUrl: avatarUrl || undefined,
      });
      setSuccess(true);
    } catch {
      setError("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Mon Profil
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Profil mis à jour avec succès
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
          <UserAvatar
            name={name}
            avatarUrl={avatarPreview || undefined}
            size={80}
          />
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <Button
              variant="outlined"
              startIcon={<PhotoCamera />}
              onClick={() => fileInputRef.current?.click()}
            >
              Changer l&apos;avatar
            </Button>
          </Box>
        </Box>

        <TextField
          fullWidth
          label="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
          required
        />

        <TextField
          fullWidth
          label="Email"
          value={user.email}
          disabled
          sx={{ mb: 2 }}
        />

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              label="Adresse de travail"
              value={workAddress}
              onChange={(e) => {
                setWorkAddress(e.target.value);
                setSelectedCoords(null);
              }}
              placeholder="123 Rue Example, 75001 Paris"
            />
            <Button
              variant="outlined"
              onClick={handleSearchAddress}
              disabled={searching || !workAddress.trim()}
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

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={saving}
          sx={{ mt: 2 }}
        >
          {saving ? <CircularProgress size={24} /> : "Sauvegarder"}
        </Button>
      </Box>
    </Paper>
  );
}
