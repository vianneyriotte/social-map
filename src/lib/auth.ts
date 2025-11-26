import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import prisma from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [nextCookies()],
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
