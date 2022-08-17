import { createRouter } from "./context";
//import { createProtectedRouter } from "./protected-router";
import { prisma } from "../../server/db/client";
import { z } from "zod";
import { DDragon } from "@fightmegg/riot-api";

interface champObject {
  id: number;
  name: string;
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
    resolve({ ctx }) {
      return prisma.user.findFirst({
        where: { id: ctx.session?.user?.id },
      });
    },
  })
  .mutation("updateProfile", {
    input: z.object({
      name: z.string(),
      firstName: z.string(),
      age: z.number(),
      description: z.string(),
      fav_champion1: z.string(),
      fav_champion2: z.string(),
      fav_champion3: z.string(),
    }),

    async resolve({ ctx, input }) {
      await prisma.user.update({
        where: { id: ctx.session?.user?.id },
        data: {
          ...input,
        },
      });
    },
  }); /*
  .mutation("fillDb", {
    async resolve({}) {
      const ddragon = new DDragon();
      const champs = await ddragon.champion.all();
      const champObjects: champObject[] = [];
      let index = 0;
      Object.values(champs.data).forEach((val) => {
        champObjects.push({ name: val.name, id: index });
        index++;
      });

      await prisma.champion.createMany({ data: champObjects });
    },
  })*/
