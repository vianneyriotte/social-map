import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import { getDb } from "./prisma";
import { sendMagicLinkEmail } from "./email";

function createAuth() {
  return betterAuth({
    database: prismaAdapter(getDb(), {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    plugins: [
      nextCookies(),
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await sendMagicLinkEmail({ email, url });
        },
        expiresIn: 300,
      }),
    ],
    user: {
      additionalFields: {
        workAddress: {
          type: "string",
          required: false,
        },
        workLatitude: {
          type: "number",
          required: false,
        },
        workLongitude: {
          type: "number",
          required: false,
        },
        avatarUrl: {
          type: "string",
          required: false,
        },
      },
    },
  });
}

export const auth = createAuth();
