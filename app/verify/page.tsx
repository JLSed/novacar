"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const verifyEmail = async () => {
      // Get the token from URL parameters
      const token = searchParams.get("token");
      const type = searchParams.get("type");

      if (!token || type !== "email") {
        setStatus("error");
        setMessage(
          "Invalid verification link. Please check your email for the correct link."
        );
        return;
      }

      try {
        // Verify the email with Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email",
        });

        if (error) {
          setStatus("error");
          setMessage(
            error.message || "Verification failed. The link may have expired."
          );
        } else {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("An error occurred during verification. Please try again.");
      }
    };

    verifyEmail();
  }, [searchParams, supabase.auth]);

  const handleContinue = () => {
    if (status === "success") {
      router.push("/home");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="border-border shadow-lg">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              {status === "loading" && (
                <div className="relative">
                  <Mail className="w-16 h-16 text-primary" />
                  <Loader2 className="w-16 h-16 text-accent2 absolute inset-0 animate-spin" />
                </div>
              )}
              {status === "success" && (
                <div className="relative">
                  <CheckCircle2 className="w-20 h-20 text-primary animate-bounce" />
                </div>
              )}
              {status === "error" && (
                <div className="relative">
                  <XCircle className="w-20 h-20 text-destructive animate-pulse" />
                </div>
              )}
            </div>

            <div>
              <CardTitle className="text-2xl">
                {status === "loading" && (
                  <span className="text-primary">
                    Verifying <span className="text-accent2">Your Email</span>
                  </span>
                )}
                {status === "success" && (
                  <span className="text-primary">
                    <span className="text-accent2">Verification</span> Complete
                  </span>
                )}
                {status === "error" && (
                  <span className="text-destructive">
                    Verification <span className="text-accent2">Failed</span>
                  </span>
                )}
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                {status === "loading" &&
                  "Please wait while we verify your email address..."}
                {status === "success" && message}
                {status === "error" && message}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {status === "loading" && (
              <div className="flex justify-center py-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-3 h-3 bg-accent2 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm text-center text-foreground">
                    Your account is now fully activated. You can now access all
                    features of <span className="logo text-xl">NovaCar</span>.
                  </p>
                </div>
                <Button
                  onClick={handleContinue}
                  className="shining_button w-full"
                  size="lg"
                >
                  Continue to Dashboard
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-center text-foreground">
                    If you continue to experience issues, please contact our
                    support team or try signing up again.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => router.push("/signup")}
                    className="shining_button w-full"
                    size="lg"
                  >
                    Sign Up Again
                  </Button>
                  <Button
                    onClick={handleContinue}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </div>
              </div>
            )}
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
