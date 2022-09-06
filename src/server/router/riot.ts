import { createRouter } from "./context";
//import { createProtectedRouter } from "./protected-router";
import { prisma } from "../../server/db/client";
import { z } from "zod";

export const riotRouter = createRouter()
  .query("allChampNames", {
    async resolve({}) {
      const allChampNames = await prisma.champion.findMany();

      return allChampNames;
    },
  })
  .mutation("createRiotAccount", {
    input: z.object({
      ign: z.string(),
      server: z.enum([
        "eun1",
        "euw1",
        "na1",
        "la1",
        "la2",
        "kr",
        "jp1",
        "br1",
        "oc1",
        "ru",
        "tr1",
      ]),
    }),
    async resolve({ ctx, input }) {
      await prisma.leagueAccount.create({
        data: {
          ign: input.ign,
          server: input.server,
          userId: ctx.session!.user!.id, //make this query callable only when logged
        },
      });
    },
  })
  .mutation("updateRiotAccount", {
    input: z.object({
      ign: z.string(),
      server: z.enum([
        "eun1",
        "euw1",
        "na1",
        "la1",
        "la2",
        "kr",
        "jp1",
        "br1",
        "oc1",
        "ru",
        "tr1",
      ]),
    }),
    async resolve({ ctx, input }) {
      await prisma.leagueAccount.update({
        where: { userId: ctx.session?.user?.id },
        data: { ...input },
      });
    },
  });
