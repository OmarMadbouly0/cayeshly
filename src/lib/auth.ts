import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber, twoFactor } from "better-auth/plugins";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    phoneNumber({
      sendOTP: ({ phoneNumber, code }) => {
        console.log(phoneNumber, code);
      },
    }),
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          console.log(user.id, otp);
        },
        period: 2,
        allowedAttempts: 3,
      },
    }),
  ],
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/get-session": false,
      "/sign-in/email": {
        window: 10,
        max: 3,
      },
      "/sign-in/phone-number": { window: 60, max: 5 },
      "/two-factor/send-otp": {
        window: 60,
        max: 3,
      },
      "/two-factor/*": {
        window: 10,
        max: 3,
      },
    },
  },
});
