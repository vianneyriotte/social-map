"use client";

import { useState, useRef } from "react";
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
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import UserAvatar from "./UserAvatar";
import { geocodeAddress, GeocodingResult } from "@/lib/geocoding";
import { signOut, authClient } from "@/lib/auth-client";

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    workAddress?: string | null;
    workLatitude?: number | null;
    workLongitude?: number | null;
    avatarUrl?: string | null;
    showOnMap: boolean;
  };
  onSave: (data: {
    name: string;
    workAddress: string;
    workLatitude: number;
    workLongitude: number;
    avatarUrl?: string;
    showOnMap: boolean;
  }) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function ProfileForm({ user, onSave, onDelete }: ProfileFormProps) {
  const router = useRouter();
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
  const [showOnMap, setShowOnMap] = useState(user.showOnMap);

  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteAccount = async () => {
    if (deleteEmail !== user.email) {
      setDeleteError("L'adresse email ne correspond pas");
      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      await onDelete();
      // Déconnecter côté client et rediriger
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch {
      setDeleteError("Erreur lors de la suppression du compte");
      setDeleting(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    setChangingPassword(true);

    await authClient.changePassword(
      {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
      {
        onSuccess: () => {
          setPasswordSuccess(true);
          setChangingPassword(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmNewPassword("");
          setTimeout(() => {
            setPasswordDialogOpen(false);
            setPasswordSuccess(false);
          }, 2000);
        },
        onError: (ctx) => {
          setPasswordError(ctx.error.message || "Erreur lors du changement de mot de passe");
          setChangingPassword(false);
        },
      }
    );
  };

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
        showOnMap,
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

        <FormControlLabel
          control={
            <Switch
              checked={showOnMap}
              onChange={(e) => setShowOnMap(e.target.checked)}
            />
          }
          label="Apparaître sur la carte"
          sx={{ mb: 2 }}
        />

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

      <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}>
        <Typography variant="subtitle2" gutterBottom>
          Sécurité
        </Typography>
        <Button
          variant="outlined"
          startIcon={<LockIcon />}
          onClick={() => setPasswordDialogOpen(true)}
        >
          Changer le mot de passe
        </Button>
      </Box>

      <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: "divider" }}>
        <Typography variant="subtitle2" color="error" gutterBottom>
          Zone de danger
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteDialogOpen(true)}
        >
          Supprimer mon compte
        </Button>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteEmail("");
          setDeleteError("");
        }}
      >
        <DialogTitle>Supprimer votre compte</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Cette action est irréversible. Toutes vos données seront
            définitivement supprimées. Pour confirmer, veuillez saisir votre
            adresse email : <strong>{user.email}</strong>
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <TextField
            autoFocus
            fullWidth
            label="Adresse email"
            value={deleteEmail}
            onChange={(e) => setDeleteEmail(e.target.value)}
            placeholder={user.email}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeleteEmail("");
              setDeleteError("");
            }}
            disabled={deleting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={deleting || !deleteEmail}
          >
            {deleting ? <CircularProgress size={24} /> : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={passwordDialogOpen}
        onClose={() => {
          setPasswordDialogOpen(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmNewPassword("");
          setPasswordError("");
          setPasswordSuccess(false);
        }}
      >
        <DialogTitle>Changer le mot de passe</DialogTitle>
        <DialogContent>
          {passwordSuccess ? (
            <Alert severity="success">
              Mot de passe modifié avec succès !
            </Alert>
          ) : (
            <>
              {passwordError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {passwordError}
                </Alert>
              )}
              <TextField
                autoFocus
                fullWidth
                type="password"
                label="Mot de passe actuel"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                margin="normal"
                autoComplete="current-password"
              />
              <TextField
                fullWidth
                type="password"
                label="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                margin="normal"
                autoComplete="new-password"
                helperText="Minimum 8 caractères"
              />
              <TextField
                fullWidth
                type="password"
                label="Confirmer le nouveau mot de passe"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                margin="normal"
                autoComplete="new-password"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPasswordDialogOpen(false);
              setCurrentPassword("");
              setNewPassword("");
              setConfirmNewPassword("");
              setPasswordError("");
              setPasswordSuccess(false);
            }}
            disabled={changingPassword}
          >
            {passwordSuccess ? "Fermer" : "Annuler"}
          </Button>
          {!passwordSuccess && (
            <Button
              onClick={handleChangePassword}
              variant="contained"
              disabled={changingPassword || !currentPassword || !newPassword || !confirmNewPassword}
            >
              {changingPassword ? <CircularProgress size={24} /> : "Modifier"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
