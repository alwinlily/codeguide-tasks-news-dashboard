"use client";

import { SignUp } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        {/* Sign Up Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Create Account
            </CardTitle>
            <p className="text-muted-foreground">
              Join us today! Create an account to access your dashboard.
            </p>
          </CardHeader>
          <CardContent>
            <SignUp
              path="/sign-up"
              routing="path"
              signInUrl="/sign-in"
              redirectUrl="/"
              appearance={{
                elements: {
                  formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                  card: "shadow-none",
                  headerTitle: "text-2xl font-bold",
                  headerSubtitle: "text-muted-foreground",
                  socialButtonsBlockButton: "border-border hover:bg-accent",
                  formFieldInput: "border-input",
                  footerActionLink: "text-primary hover:text-primary/90"
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Sign In Link */}
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
