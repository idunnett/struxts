import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in",
  "/sign-in/(.*)",
  "/pricing",
])

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isPublicRoute(request)) return
  if (!(await convexAuth.isAuthenticated()))
    return nextjsMiddlewareRedirect(request, "/sign-in")
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
