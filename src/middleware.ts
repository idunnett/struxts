// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// const isPublicRoute = createRouteMatcher([
//   "/",
//   // "/pricing",
//   "/sign-in",
//   "/api/uploadthing",
// ])

// export default clerkMiddleware((auth, request) => {
//   if (isPublicRoute(request)) return
//   auth().protect()
// })

// export const config = {
//   matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
// }

import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server"

const isSignInPage = createRouteMatcher(["/sign-in"])
const isProtectedRoute = createRouteMatcher(["/structure(.*)"])

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const url = new URL(request.url)
  const isAuthed = await convexAuth.isAuthenticated()

  if (isSignInPage(request) && isAuthed) {
    return nextjsMiddlewareRedirect(request, "/structures")
  }
  if (isProtectedRoute(request) && !isAuthed) {
    return nextjsMiddlewareRedirect(request, "/sign-in")
  }
})

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
