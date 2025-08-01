import { currentUser } from "@clerk/nextjs/server";
import db from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();
  if (!user) return null;

  try {
    let dbUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          clerkUserId: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
          imageUrl: user.imageUrl ?? null,
          phone: user.phoneNumbers?.[0]?.phoneNumber ?? null,
        },
      });
    }

    return { success: true, data: dbUser };
  } catch (error) {
    throw new Error(`Failed TO Check User`);
  }
};
