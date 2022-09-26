import { createRouter } from "./context";
//import { createProtectedRouter } from "./protected-router";
import { prisma } from "../../server/db/client";
import { z } from "zod";
import { DDragon } from "@fightmegg/riot-api";
import { TRPCError } from "@trpc/server";
import { FilterIcon } from "@heroicons/react/outline";

interface champObject {
  id: number;
  name: string;
  uniqueName: string;
}

export const userRouter = createRouter()
  .query("getSession", {
    resolve({ ctx }) {
      if (!ctx.session) {
        throw new TRPCError({
          message: "You are not signed in",
          code: "UNAUTHORIZED",
        });
      }
      return ctx.session;
    },
  })
  .query("me", {
    resolve({ ctx }) {
      if (!ctx.session || !ctx.session.user) {
        throw new TRPCError({
          message: "You are not signed in",
          code: "UNAUTHORIZED",
        });
      }

      return ctx.session.user;
    },
  })
  .query("meFullInfo", {
    async resolve({ ctx }) {
      if (!ctx.session || !ctx.session.user) {
        throw new TRPCError({
          message: "You are not signed in",
          code: "UNAUTHORIZED",
        });
      }

      const user = await prisma.user.findFirst({
        where: { id: ctx.session?.user?.id },
      });

      return user;
    },
  })
  .query("meFullInfoWithRiotAccounts", {
    async resolve({ ctx }) {
      if (!ctx.session || !ctx.session.user) {
        throw new TRPCError({
          message: "You are not signed in",
          code: "UNAUTHORIZED",
        });
      }

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
      if (!ctx.session || !ctx.session.user) {
        throw new TRPCError({
          message: "You are not signed in",
          code: "UNAUTHORIZED",
        });
      }

      await prisma.user.update({
        where: { id: ctx.session?.user?.id },
        data: {
          ...input,
        },
      });
    },
  })
  /*.mutation("fillDb", {
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
  })*/
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
  })
  .query("getFilterForUser", {
    async resolve({ ctx }) {
      if (!ctx.session || !ctx.session.user?.id) {
        throw new TRPCError({
          message: "You are not signed in",
          code: "UNAUTHORIZED",
        });
      }
      const filter = await prisma.filter.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
      });

      if (!filter) {
        const emptyFilter = await prisma.filter.create({
          data: {
            userId: ctx.session.user.id,
            ageLowerLimit: 14,
            ageUpperLimit: 50,
          },
        });

        return emptyFilter;
      } else {
        return filter;
      }
    },
  })
  .mutation("updateFilterForUser", {
    input: z.object({
      ageLowerLimit: z.number(),
      ageUpperLimit: z.number(),
      genders: z.array(z.enum(["Male", "Female", "Nonconforming"])),
      roles: z.array(z.enum(["Top", "Jungle", "Mid", "ADC", "Support"])),
      servers: z.array(
        z.enum([
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
        ])
      ),
      tiers: z.array(
        z.enum([
          "CHALLENGER",
          "GRANDMASTER",
          "MASTER",
          "DIAMOND",
          "PLATINUM",
          "GOLD",
          "SILVER",
          "BRONZE",
          "IRON",
        ])
      ),
    }),
    async resolve({ input, ctx }) {
      if (!ctx.session || !ctx.session.user?.id) {
        throw new TRPCError({
          message: "You are not signed in",
          code: "UNAUTHORIZED",
        });
      }

      await prisma.filter.update({
        where: {
          userId: ctx.session.user.id,
        },
        data: {
          ageLowerLimit: input.ageLowerLimit,
          ageUpperLimit: input.ageUpperLimit,
          genders: input.genders,
          roles: input.roles,
          servers: input.servers,
          tiers: input.tiers,
        },
      });
    },
  });
