"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import { authClient } from "@/lib/auth-client";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (!token) {
      setError("Token de réinitialisation manquant");
      return;
    }

    setLoading(true);

    await authClient.resetPassword(
      {
        newPassword: password,
        token,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setLoading(false);
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Erreur lors de la réinitialisation");
          setLoading(false);
        },
      }
    );
  };

  if (!token) {
    return (
      <Paper sx={{ p: 4, width: "100%" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Lien de réinitialisation invalide ou expiré.
        </Alert>
        <Typography align="center">
          <Link component={NextLink} href="/login">
            Retour à la connexion
          </Link>
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 4, width: "100%" }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Nouveau mot de passe
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          Mot de passe réinitialisé avec succès. Redirection...
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nouveau mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            autoComplete="new-password"
            helperText="Minimum 8 caractères"
          />

          <TextField
            fullWidth
            label="Confirmer le mot de passe"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            required
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Réinitialiser"}
          </Button>

          <Typography align="center">
            <Link component={NextLink} href="/login">
              Retour à la connexion
            </Link>
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default function ResetPasswordPage() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Suspense
          fallback={
            <Paper sx={{ p: 4, width: "100%", textAlign: "center" }}>
              <CircularProgress />
            </Paper>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </Box>
    </Container>
  );
}
