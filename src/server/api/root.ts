import { structureRouter } from "~/server/api/routers/structure"
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc"
import { edgeRouter } from "./routers/edges"
import { fileRouter } from "./routers/file"
import { nodeRouter } from "./routers/node"
import { userRouter } from "./routers/user"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  structure: structureRouter,
  node: nodeRouter,
  edge: edgeRouter,
  user: userRouter,
  file: fileRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
