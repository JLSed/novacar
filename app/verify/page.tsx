"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";

function VerifyContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="border-border shadow-lg">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="relative">
                <CheckCircle2 className="w-20 h-20 text-primary animate-bounce" />
              </div>
            </div>

            <div>
              <CardTitle className="text-2xl">
                <span className="text-primary">
                  Verification <span className="text-accent2">Success</span>
                </span>
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                Your email has been verified successfully!
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm text-center text-foreground">
                  Your account is now fully activated. You can now access all
                  features of <span className="logo text-xl">NovaCar</span>.
                </p>
              </div>
              <Button
                onClick={() => router.push("/login")}
                className="shining_button w-full"
                size="lg"
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <a
              href="#"
              className="text-primary hover:text-accent2 underline transition-colors"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
