import { createRouter } from "./context";
//import { createProtectedRouter } from "./protected-router";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { User } from "@prisma/client";

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
        return null;
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

      const user = await ctx.prisma.user.findFirst({
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

      const user = await ctx.prisma.user.findFirst({
        where: { id: ctx.session?.user?.id },
      });

      const accounts = await ctx.prisma.leagueAccount.findMany({
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

      await ctx.prisma.user.update({
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
    async resolve({ input, ctx }) {
      const user = await ctx.prisma.user.findFirst({
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

      await ctx.prisma.user.update({
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
      const filter = await ctx.prisma.filter.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
      });

      return filter;
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
      ignoreFilter: z.boolean(),
    }),
    async resolve({ input, ctx }) {
      if (!ctx.session || !ctx.session.user?.id) {
        throw new TRPCError({
          message: "You are not signed in",
          code: "UNAUTHORIZED",
        });
      }

      if (input.ignoreFilter) {
        await ctx.prisma.filter.deleteMany({
          where: { userId: ctx.session.user.id },
        });
      } else {
        await ctx.prisma.filter.upsert({
          where: {
            userId: ctx.session.user.id,
          },
          update: {
            ageLowerLimit: input.ageLowerLimit,
            ageUpperLimit: input.ageUpperLimit,
            genders: input.genders,
            roles: input.roles,
            servers: input.servers,
            tiers: input.tiers,
          },
          create: {
            ageLowerLimit: input.ageLowerLimit,
            ageUpperLimit: input.ageUpperLimit,
            genders: input.genders,
            roles: input.roles,
            servers: input.servers,
            tiers: input.tiers,
            userId: ctx.session.user.id,
          },
        });
      }
    },
  })
  .mutation("blockUser", {
    input: z.object({
      blockedId: z.string(),
    }),
    async resolve({ input, ctx }) {
      if (!ctx.session || !ctx.session.user?.id) {
        throw new TRPCError({
          message: "You are not signed in",
          code: "UNAUTHORIZED",
        });
      }

      await ctx.prisma.block.create({
        data: {
          blockByUserId: ctx.session.user.id,
          blockedUserId: input.blockedId,
        },
      });
    },
  })
  .query("isBlocked", {
    input: z.object({
      blockedId: z.string(),
    }),
    async resolve({ input, ctx }) {
      if (!ctx.session || !ctx.session.user?.id) {
        return false; //if youre not logged, a user cant block you
      }

      const blockExists = await ctx.prisma.block.count({
        where: {
          blockByUserId: ctx.session.user.id,
          blockedUserId: input.blockedId,
        },
      });

      return blockExists > 0;
    },
  })
  .query("searchUsers", {
    input: z.object({
      searchTerm: z.string(),
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.string().nullish(),
    }),
    async resolve({ ctx, input }) {
      const limit = input.limit ?? 20;
      const { cursor } = input;

      const users = await ctx.prisma.user.findMany({
        take: limit + 1, //+ 1 item is next cursor
        select: {
          id: true,
          name: true,
          firstName: true,
          image: true,
          role: true,
          fav_champion1: true,
          tier: true,
        },
        where: {
          OR: [
            { name: { contains: input.searchTerm, mode: "insensitive" } },
            { firstName: { contains: input.searchTerm, mode: "insensitive" } },
            {
              description: { contains: input.searchTerm, mode: "insensitive" },
            },
          ],
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          riot_accounts: {
            _count: "desc",
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (users.length > limit) {
        nextCursor = users.pop()!.id;
      }

      return { users, nextCursor };
    },
  });
