import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SendMagicLinkParams {
  email: string;
  url: string;
}

export async function sendMagicLinkEmail({ email, url }: SendMagicLinkParams) {
  if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
    console.log("\n🔗 Magic Link URL:", url);
    console.log("📧 For:", email, "\n");
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@example.com",
    to: email,
    subject: "Votre lien de connexion",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Connexion à Social Map</h2>
        <p>Cliquez sur le bouton ci-dessous pour vous connecter :</p>
        <a href="${url}"
           style="display: inline-block; padding: 12px 24px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Se connecter
        </a>
        <p style="color: #666; font-size: 14px;">
          Ce lien expire dans 5 minutes. Si vous n'avez pas demandé ce lien, ignorez cet email.
        </p>
        <p style="color: #999; font-size: 12px;">
          Ou copiez ce lien : ${url}
        </p>
      </div>
    `,
    text: `Connexion à Social Map\n\nCliquez sur ce lien pour vous connecter : ${url}\n\nCe lien expire dans 5 minutes.`,
  });
}

interface SendResetPasswordParams {
  email: string;
  url: string;
}

export async function sendResetPasswordEmail({ email, url }: SendResetPasswordParams) {
  if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
    console.log("\n🔑 Reset Password URL:", url);
    console.log("📧 For:", email, "\n");
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@example.com",
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous :</p>
        <a href="${url}"
           style="display: inline-block; padding: 12px 24px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Réinitialiser mon mot de passe
        </a>
        <p style="color: #666; font-size: 14px;">
          Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        </p>
        <p style="color: #999; font-size: 12px;">
          Ou copiez ce lien : ${url}
        </p>
      </div>
    `,
    text: `Réinitialisation de mot de passe\n\nCliquez sur ce lien pour réinitialiser votre mot de passe : ${url}\n\nCe lien expire dans 1 heure.`,
  });
}

interface SendEventInvitationParams {
  email: string;
  inviteeName: string;
  organizerName: string;
  eventTitle: string;
  eventDate: string;
  eventPlace: string;
  eventsUrl: string;
}

export async function sendEventInvitationEmail({
  email,
  inviteeName,
  organizerName,
  eventTitle,
  eventDate,
  eventPlace,
  eventsUrl,
}: SendEventInvitationParams) {
  if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
    console.log("\n📅 Event Invitation:");
    console.log("📧 To:", email, `(${inviteeName})`);
    console.log("🎉 Event:", eventTitle);
    console.log("👤 From:", organizerName);
    console.log("📍 Place:", eventPlace);
    console.log("🕐 Date:", eventDate);
    console.log("🔗 URL:", eventsUrl, "\n");
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@example.com",
    to: email,
    subject: `Invitation : ${eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Vous êtes invité(e) !</h2>
        <p>Bonjour ${inviteeName},</p>
        <p><strong>${organizerName}</strong> vous invite à un événement :</p>
        <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0; color: #1976d2;">${eventTitle}</h3>
          <p style="margin: 4px 0;"><strong>📅 Date :</strong> ${eventDate}</p>
          <p style="margin: 4px 0;"><strong>📍 Lieu :</strong> ${eventPlace}</p>
        </div>
        <a href="${eventsUrl}"
           style="display: inline-block; padding: 12px 24px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Voir l'invitation
        </a>
        <p style="color: #666; font-size: 14px;">
          Connectez-vous à Social Map pour accepter ou décliner cette invitation.
        </p>
      </div>
    `,
    text: `Vous êtes invité(e) !\n\nBonjour ${inviteeName},\n\n${organizerName} vous invite à un événement :\n\n${eventTitle}\nDate : ${eventDate}\nLieu : ${eventPlace}\n\nConnectez-vous à Social Map pour répondre : ${eventsUrl}`,
  });
}

interface SendEventResponseParams {
  email: string;
  organizerName: string;
  participantName: string;
  eventTitle: string;
  eventDate: string;
  eventsUrl: string;
}

export async function sendEventAcceptedEmail({
  email,
  organizerName,
  participantName,
  eventTitle,
  eventDate,
  eventsUrl,
}: SendEventResponseParams) {
  if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
    console.log("\n✅ Event Accepted:");
    console.log("📧 To:", email, `(${organizerName})`);
    console.log("🎉 Event:", eventTitle);
    console.log("👤 Accepted by:", participantName);
    console.log("🕐 Date:", eventDate);
    console.log("🔗 URL:", eventsUrl, "\n");
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@example.com",
    to: email,
    subject: `${participantName} a accepté : ${eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bonne nouvelle !</h2>
        <p>Bonjour ${organizerName},</p>
        <p><strong>${participantName}</strong> a accepté votre invitation à :</p>
        <div style="background-color: #e8f5e9; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #4caf50;">
          <h3 style="margin: 0 0 8px 0; color: #2e7d32;">${eventTitle}</h3>
          <p style="margin: 4px 0;"><strong>📅 Date :</strong> ${eventDate}</p>
        </div>
        <a href="${eventsUrl}"
           style="display: inline-block; padding: 12px 24px; background-color: #4caf50; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Voir l'événement
        </a>
      </div>
    `,
    text: `Bonne nouvelle !\n\nBonjour ${organizerName},\n\n${participantName} a accepté votre invitation à "${eventTitle}" (${eventDate}).\n\nVoir l'événement : ${eventsUrl}`,
  });
}
