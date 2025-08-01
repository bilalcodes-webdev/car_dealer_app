import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import arcjet, { detectBot, shield } from "arcjet";
import { NextResponse } from "next/server";

const isProtectedRoutes = createRouteMatcher([
  "/admin(.*)",
  "/saved-cars(.*)",
  "/reservations(.*)",
]);

// const aj = arcjet({
//   key: process.env.ARCJET_KEY,
//   log: console, // ✅ Required to avoid "Log is required" error
//   rules: [
//     shield({ mode: "LIVE" }),
//     detectBot({
//       mode: "LIVE",
//       allow: ["CATEGORY:SEARCH_ENGINE"],
//     }),
//   ],
// });

const clerk = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId && isProtectedRoutes(req)) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  return NextResponse.next();
});

export default clerk;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
