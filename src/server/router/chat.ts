import { createRouter } from "./context";
//import { createProtectedRouter } from "./protected-router";
import { prisma } from "../../server/db/client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import PusherServer from "pusher";
import { env } from "../../env/server.mjs";
import { compareStrings } from "../../utils/compareStrings";

const pusherServerClient = new PusherServer({
  appId: env.PUSHER_APP_ID!,
  key: env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: env.PUSHER_APP_SECRET!,
  cluster: env.PUSHER_APP_CLUSTER!,
});

export const chatRouter = createRouter().mutation("sendMessage", {
  input: z.object({
    messageBody: z.string(),
    recipientName: z.string(),
  }),
  async resolve({ ctx, input }) {
    if (!ctx.session || !ctx.session.user?.name) {
      throw new TRPCError({
        message: "You are not signed in",
        code: "UNAUTHORIZED",
      });
    }

    let participants = compareStrings(
      input.recipientName,
      ctx.session.user?.name
    );

    pusherServerClient.trigger(
      `${participants[0]}-${participants[1]}`,
      "message-sent",
      { body: input.messageBody, senderName: ctx.session.user?.name }
    );
  },
});
