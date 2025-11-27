"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import NextLink from "next/link";
import { signIn, authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await signIn.email(
      {
        email,
        password,
        callbackURL: "/map",
      },
      {
        onSuccess: () => {
          router.push("/map");
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Erreur de connexion");
          setLoading(false);
        },
      }
    );
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMagicLinkLoading(true);
    setError("");
    setMagicLinkSent(false);

    await authClient.signIn.magicLink(
      {
        email: magicLinkEmail,
        callbackURL: "/map",
      },
      {
        onSuccess: () => {
          setMagicLinkSent(true);
          setMagicLinkLoading(false);
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Erreur lors de l'envoi du lien");
          setMagicLinkLoading(false);
        },
      }
    );
  };

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
        <Paper sx={{ p: 4, width: "100%" }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Connexion
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
            />

            <TextField
              fullWidth
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : "Se connecter"}
            </Button>

            <Typography align="center">
              Pas encore de compte ?{" "}
              <Link component={NextLink} href="/signup">
                S&apos;inscrire
              </Link>
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }}>ou</Divider>

          <Box component="form" onSubmit={handleMagicLink}>
            <Typography variant="subtitle1" gutterBottom>
              Connexion par Magic Link
            </Typography>

            {magicLinkSent && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Un lien de connexion a été envoyé à votre adresse email.
                Vérifiez votre boîte de réception.
              </Alert>
            )}

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={magicLinkEmail}
              onChange={(e) => setMagicLinkEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
            />

            <Button
              type="submit"
              variant="outlined"
              fullWidth
              size="large"
              disabled={magicLinkLoading}
              sx={{ mt: 2 }}
            >
              {magicLinkLoading ? (
                <CircularProgress size={24} />
              ) : (
                "Envoyer le lien de connexion"
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
