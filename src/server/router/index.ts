// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { userRouter } from "./user";
import { riotRouter } from "./riot";
import { matchRouter } from "./match";
import { chatRouter } from "./chat";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("user.", userRouter)
  .merge("match.", matchRouter)
  .merge("riot.", riotRouter)
  .merge("chat.", chatRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
