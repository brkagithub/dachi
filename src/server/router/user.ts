import { createRouter } from "./context";
//import { createProtectedRouter } from "./protected-router";
import { prisma } from "../../server/db/client";
import { z } from "zod";
import { DDragon } from "@fightmegg/riot-api";
import { TRPCError } from "@trpc/server";

interface champObject {
  id: number;
  name: string;
  uniqueName: string;
}

export const userRouter = createRouter()
  .query("getSession", {
    resolve({ ctx }) {
      return ctx.session;
    },
  })
  .query("me", {
    resolve({ ctx }) {
      return ctx.session?.user;
    },
  })
  .query("meFullInfo", {
    async resolve({ ctx }) {
      const user = await prisma.user.findFirst({
        where: { id: ctx.session?.user?.id },
      });

      return user;
    },
  })
  .query("meFullInfoWithRiotAccounts", {
    async resolve({ ctx }) {
      const user = await prisma.user.findFirst({
        where: { id: ctx.session?.user?.id },
      });

      const accounts = await prisma.leagueAccount.findMany({
        where: { userId: user?.id },
      });

      return { ...user, accounts: accounts };
    },
  })
  .mutation("updateProfile", {
    input: z.object({
      name: z.string(),
      firstName: z.string(),
      age: z.number(),
      description: z.string(),
      fav_champion1: z.string(), //todo - make champion enum
      fav_champion2: z.string(),
      fav_champion3: z.string(),
      fav_champion1_img: z.string(),
      fav_champion2_img: z.string(),
      fav_champion3_img: z.string(),
      role: z.enum(["Top", "Jungle", "Mid", "ADC", "Support"]),
      gender: z.enum(["Male", "Female", "Nonconforming"]),
      twitter: z.string(),
      instagram: z.string(),
      twitch: z.string(),
      youtube: z.string(),
    }),

    async resolve({ ctx, input }) {
      await prisma.user.update({
        where: { id: ctx.session?.user?.id },
        data: {
          ...input,
        },
      });
    },
  })
  .mutation("fillDb", {
    async resolve({}) {
      const ddragon = new DDragon();
      const champs = await ddragon.champion.all();
      const champObjects: champObject[] = [];
      let index = 0;
      Object.values(champs.data).forEach((val) => {
        champObjects.push({ name: val.name, id: index, uniqueName: val.id });
        index++;
      });

      await prisma.champion.createMany({ data: champObjects });
    },
  })
  .query("getImageAndFirstNameByName", {
    input: z.object({ name: z.string() }),
    async resolve({ input }) {
      const user = await prisma.user.findFirst({
        where: { name: input.name },
        select: {
          image: true,
          firstName: true,
        },
      });

      return user;
    },
  })
  .mutation("changeProfilePictureURL", {
    input: z.object({ newUrl: z.string() }),
    async resolve({ ctx, input }) {
      if (!ctx.session || !ctx.session.user?.id) {
        throw new TRPCError({
          message: "You are not signed in",
          code: "UNAUTHORIZED",
        });
      }

      await prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { image: input.newUrl },
      });
    },
  });
