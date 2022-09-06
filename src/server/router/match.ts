import { createRouter } from "./context";
//import { createProtectedRouter } from "./protected-router";
import { prisma } from "../../server/db/client";
import { z } from "zod";
import { env } from "../../env/server.mjs";

export const matchRouter = createRouter()
  .query("getPotentialMatch", {
    async resolve({ ctx, input }) {
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
    async resolve({ ctx, input }) {
      await prisma.match.create({
        data: {
          requestInitiatorId: input.requestInitiatorId,
          requestTargetId: input.requestTargetId,
          pending: input.addAsFriend,
        },
      });
    },
  });
