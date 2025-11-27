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
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import NextLink from "next/link";
import { signIn, authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setError("");
    setForgotSent(false);

    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          redirectTo: "/reset-password",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Erreur lors de l'envoi");
      } else {
        setForgotSent(true);
      }
    } catch {
      setError("Erreur lors de l'envoi");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setError("");
    setMagicLinkSent(false);
    setForgotSent(false);
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

          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab label="Mot de passe" />
            <Tab label="Magic Link" />
            <Tab label="Oublié ?" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {tab === 0 && (
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
          )}

          {tab === 1 && (
            <Box component="form" onSubmit={handleMagicLink}>
              {magicLinkSent ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Un lien de connexion a été envoyé à votre adresse email.
                  Vérifiez votre boîte de réception.
                </Alert>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Recevez un lien de connexion par email, sans mot de passe.
                </Typography>
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
                variant="contained"
                fullWidth
                size="large"
                disabled={magicLinkLoading}
                sx={{ mt: 3, mb: 2 }}
              >
                {magicLinkLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Envoyer le lien"
                )}
              </Button>

              <Typography align="center">
                Pas encore de compte ?{" "}
                <Link component={NextLink} href="/signup">
                  S&apos;inscrire
                </Link>
              </Typography>
            </Box>
          )}

          {tab === 2 && (
            <Box component="form" onSubmit={handleForgotPassword}>
              {forgotSent ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Si un compte existe avec cet email, vous recevrez un lien de
                  réinitialisation.
                </Alert>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Entrez votre email pour recevoir un lien de réinitialisation.
                </Typography>
              )}

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={forgotLoading}
                sx={{ mt: 3, mb: 2 }}
              >
                {forgotLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Envoyer le lien"
                )}
              </Button>

              <Typography align="center">
                <Link
                  component="button"
                  type="button"
                  onClick={() => setTab(0)}
                  sx={{ cursor: "pointer" }}
                >
                  Retour à la connexion
                </Link>
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
