import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/architecture(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health(.*)",
  "/api-docs(.*)",
  "/api-docs/openapi(.*)",
  "/api/content(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
