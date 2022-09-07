import { createRouter } from "./context";
//import { createProtectedRouter } from "./protected-router";
import { prisma } from "../../server/db/client";
import { z } from "zod";

export const matchRouter = createRouter()
  .query("getPotentialMatch", {
    async resolve({ ctx }) {
      const alreadyMatchedInitiated = await prisma.match.findMany({
        where: {
          requestInitiatorId: ctx.session?.user?.id,
        },
        select: {
          requestTargetId: true,
        },
      });

      const alreadyMatchedTargeted = await prisma.match.findMany({
        where: {
          requestTargetId: ctx.session?.user?.id,
        },
        select: {
          requestInitiatorId: true,
        },
      });

      const alreadyMatchedWithIds = [
        //combine targeted and initiated
        ...alreadyMatchedInitiated.map((user) => user.requestTargetId),
        ...alreadyMatchedTargeted.map((user) => user.requestInitiatorId),
        ctx.session?.user?.id ? ctx.session?.user?.id : "",
      ];

      const userStillNotMatched = await prisma.user.findFirst({
        where: {
          NOT: {
            id: {
              in: alreadyMatchedWithIds,
            },
          },
        },
      });

      const userRiotAccount = await prisma.leagueAccount.findFirst({
        where: { userId: userStillNotMatched?.id },
      });

      return { user: userStillNotMatched, rankedStats: userRiotAccount };
    },
  })
  .mutation("createMatch", {
    input: z.object({
      requestInitiatorId: z.string(),
      requestTargetId: z.string(),
      addAsFriend: z.boolean(),
    }),
    async resolve({ input }) {
      const matchExists = await prisma.match.findMany({
        where: {
          OR: [
            {
              requestInitiatorId: input.requestInitiatorId,
              requestTargetId: input.requestTargetId,
            },
            {
              requestInitiatorId: input.requestTargetId,
              requestTargetId: input.requestInitiatorId,
            },
          ],
        },
      });

      if (matchExists.length > 0) {
        return;
      } else {
        await prisma.match.create({
          data: {
            requestInitiatorId: input.requestInitiatorId,
            requestTargetId: input.requestTargetId,
            pending: input.addAsFriend,
          },
        });
      }
    },
  });
