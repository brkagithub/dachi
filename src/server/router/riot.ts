import { createRouter } from "./context";
//import { createProtectedRouter } from "./protected-router";
import { prisma } from "../../server/db/client";

export const riotRouter = createRouter().query("allChampNames", {
  async resolve({}) {
    const allChampNames = await prisma.champion.findMany();

    return allChampNames;
  },
});
