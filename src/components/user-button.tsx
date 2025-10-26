"use client";

import { UserButton } from "@clerk/nextjs";

export function UserBtn() {
  return <UserButton afterSignOutUrl="/" />;
}