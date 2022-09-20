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

export const chatRouter = createRouter()
  .mutation("sendMessage", {
    input: z.object({
      messageBody: z.string(),
      recipientName: z.string(),
      messageSeen: z.boolean(),
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

      const timestamp = new Date();

      pusherServerClient.trigger(
        `${participants[0]}-${participants[1]}`,
        "message-sent",
        {
          body: input.messageBody,
          senderName: ctx.session.user?.name,
          timestamp: timestamp,
        }
      );

      const sender = await prisma.user.findFirst({
        where: {
          name: ctx.session.user?.name,
        },
        select: {
          id: true,
          name: true,
        },
      });

      const receiver = await prisma.user.findFirst({
        where: {
          name: input.recipientName,
        },
      });

      if (!receiver || !sender) return;

      await prisma.message.create({
        data: {
          body: input.messageBody,
          timestamp: timestamp,
          messageSenderId: sender.id,
          messageSenderName: sender.name!,
          messageReceiverId: receiver.id,
          messageReceiverName: receiver.name!,
          messageSeen: input.messageSeen,
        },
      });
    },
  })
  .mutation("userTyping", {
    input: z.object({
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
        "user-typing",
        {
          username: ctx.session.user.name,
        }
      );
    },
  })
  .query("previousMessages", {
    input: z.object({
      otherChatterName: z.string(),
    }),
    async resolve({ ctx, input }) {
      if (!ctx.session || !ctx.session.user?.id) {
        throw new TRPCError({
          message: "You are not signed in",
          code: "UNAUTHORIZED",
        });
      }

      const otherChatter = await prisma.user.findFirst({
        where: {
          name: { equals: input.otherChatterName },
        },
        select: {
          id: true,
        },
      });

      if (!otherChatter) return;

      /*let lastDay = Date.now() - 2 * 24 * 60 * 60 * 1000;
      let lastDayString = new Date(lastDay).toISOString();*/

      const previousMessages = await prisma.message.findMany({
        where: {
          OR: [
            {
              messageReceiverId: ctx.session.user.id,
              messageSenderId: otherChatter.id,
              //timestamp: { gte: lastDayString },
            },
            {
              messageReceiverId: otherChatter.id,
              messageSenderId: ctx.session.user.id,
              //timestamp: { gte: lastDayString },
            },
          ],
        },
        orderBy: [
          {
            timestamp: "asc",
          },
        ],
      });

      await prisma.message.updateMany({
        where: {
          messageReceiverId: { equals: ctx.session.user.id },
          messageSenderId: { equals: otherChatter.id },
          messageSeen: false,
        },
        data: {
          messageSeen: true,
        },
      });

      return previousMessages;
    },
  })
  .query("numberOfUnseenMessagesTotal", {
    async resolve({ ctx }) {
      if (!ctx.session || !ctx.session.user?.id) {
        throw new TRPCError({
          message: "You are not signed in",
          code: "UNAUTHORIZED",
        });
      }

      return await prisma.message.count({
        where: {
          messageReceiverId: { equals: ctx.session.user.id },
          messageSeen: false,
        },
      });
    },
  });
