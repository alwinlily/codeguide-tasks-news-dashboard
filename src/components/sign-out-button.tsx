"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function SignOutBtn() {
  return (
    <SignOutButton>
      <Button variant="outline">Sign Out</Button>
    </SignOutButton>
  );
}