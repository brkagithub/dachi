// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { userRouter } from "./user";
import { riotRouter } from "./riot";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("user.", userRouter)
  .merge("riot.", riotRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
