import { createRouter } from "./context";
//import { createProtectedRouter } from "./protected-router";
import { prisma } from "../../server/db/client";
import { z } from "zod";
import { PlatformId, RiotAPI } from "@fightmegg/riot-api";
import { env } from "../../env/server.mjs";
import { TRPCError } from "@trpc/server";

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
      if (!ctx.session || !ctx.session.user?.id) {
        throw new TRPCError({
          message: "You are not signed in",
          code: "UNAUTHORIZED",
        });
      }

      const rAPI = new RiotAPI(env.RIOT_API_KEY);

      const summoner = await rAPI.summoner.getBySummonerName({
        // no clue why ts errors here
        // @ts-ignore
        region: input.server,
        summonerName: input.ign, //n cannot exist
      });

      const account = await rAPI.league.getEntriesBySummonerId({
        // no clue why ts errors here
        // @ts-ignore
        region: input.server,
        summonerId: summoner.id,
      });

      const soloQAccount = account.find(
        (acc) => acc.queueType == "RANKED_SOLO_5x5"
      );

      if (soloQAccount) {
        await prisma.leagueAccount.create({
          data: {
            ign: input.ign,
            server: input.server,
            userId: ctx.session.user.id, //make this query callable only when logged
            rank: soloQAccount.rank,
            tier: soloQAccount.tier,
            leaguePoints: soloQAccount.leaguePoints,
            wins: soloQAccount.wins,
            losses: soloQAccount.losses,
          },
        });

        await prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            //@ts-ignore
            tier: soloQAccount.tier,
            server: input.server,
          },
        });
      }
    },
  })
  .mutation("updateRiotAccount", {
    input: z.object({
      userId: z.string(),
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
    async resolve({ input }) {
      const rAPI = new RiotAPI(env.RIOT_API_KEY);

      const summoner = await rAPI.summoner.getBySummonerName({
        // no clue why ts errors here
        // @ts-ignore
        region: input.server,
        summonerName: input.ign, //n cannot exist
      });

      const account = await rAPI.league.getEntriesBySummonerId({
        // no clue why ts errors here
        // @ts-ignore
        region: input.server,
        summonerId: summoner.id,
      });

      const soloQAccount = account.find(
        (acc) => acc.queueType == "RANKED_SOLO_5x5"
      );

      if (soloQAccount) {
        await prisma.leagueAccount.update({
          where: {
            userId: input.userId,
          },
          data: {
            ...input,
            rank: soloQAccount.rank,
            tier: soloQAccount.tier,
            leaguePoints: soloQAccount.leaguePoints,
            wins: soloQAccount.wins,
            losses: soloQAccount.losses,
          },
        });

        await prisma.user.update({
          where: {
            id: input.userId,
          },
          data: {
            //@ts-ignore
            tier: soloQAccount.tier,
            server: input.server,
          },
        });
      }
    },
  });
