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
