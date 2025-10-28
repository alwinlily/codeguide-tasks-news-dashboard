import { auth } from "@clerk/nextjs/server";

export function isAdmin(email?: string | null): boolean {
  return email === "alwin.lily@gmail.com";
}

export async function getCurrentUser() {
  const session = await auth();
  const { userId, sessionClaims } = session;

  if (!userId) {
    return null;
  }

  const email = sessionClaims?.email as string;
  const userIsAdmin = isAdmin(email);

  return {
    userId,
    email,
    isAdmin: userIsAdmin,
  };
}