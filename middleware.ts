import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/api/todos", "/api/urgent", "/api/news", "/api/weather"],
  afterAuth(auth, req, evt) {
    // Handle users who are not signed in
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL("/sign-in", req.url);
      return Response.redirect(signInUrl);
    }

    // Handle users who are not admins trying to access admin routes
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (!auth.sessionClaims?.metadata?.role || auth.sessionClaims.metadata.role !== "admin") {
        const homeUrl = new URL("/", req.url);
        return Response.redirect(homeUrl);
      }
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};