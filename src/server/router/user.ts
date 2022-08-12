import { createRouter } from "./context";
//import { createProtectedRouter } from "./protected-router";

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
  });
