"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";

function SignInContent() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/";

  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log("User is signed in, redirecting to dashboard");
      // Always redirect to dashboard, ignore broken redirect URL
      router.push("/");
      router.refresh();
    }
  }, [isLoaded, isSignedIn, router]);

  // Comprehensive redirect URL cleaning and validation
  const getSafeRedirectUrl = (url: string): string => {
    try {
      // If URL contains problematic patterns, use default
      if (url.includes('0.0.0.0:3001') || url.includes('/true') || url.includes('true')) {
        console.log("Detecting malformed redirect URL, using default:", url);
        return "/";
      }

      // Try to parse the URL to validate it
      const parsedUrl = new URL(url, 'http://localhost:8080');

      // Only allow relative URLs or URLs to localhost
      if (parsedUrl.hostname === 'localhost' && (parsedUrl.port === '8080' || !parsedUrl.port)) {
        return parsedUrl.pathname + parsedUrl.search;
      }

      // For any other case, return safe default
      return "/";
    } catch (error) {
      console.log("Invalid redirect URL format, using default:", url);
      return "/";
    }
  };

  const cleanRedirectUrl = getSafeRedirectUrl(redirectUrl);

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

        {/* Sign In Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Sign In
            </CardTitle>
            <p className="text-muted-foreground">
              Welcome back! Please sign in to access your dashboard.
            </p>
          </CardHeader>
          <CardContent>
            <SignIn
              path="/sign-in"
              routing="path"
              signUpUrl="/sign-up"
              redirectUrl={cleanRedirectUrl}
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

        {/* Sign Up Link */}
        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </div>

        {/* Admin Access Note */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Admin access: alwin.lily@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}