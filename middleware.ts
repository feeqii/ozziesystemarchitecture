import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  publicRoutes: [
    "/",
    "/architecture(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/health",
    "/api/content(.*)",
    "/api-docs(.*)",
  ],
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
