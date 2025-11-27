"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LogOut } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const handleLogout = async () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <CheckCircle2 className="w-24 h-24 text-primary animate-bounce" />
        </div>

        <div className="space-y-4">
          <h1 className="text-primary">
            <span className="text-accent2">Welcome</span> User!
          </h1>
          <p className="text-muted-foreground">
            Your account has been successfully created. You can now browse our
            collection of sports cars and JDM legends.
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-6">
          <Button
            onClick={() => router.push("/browse")}
            className="shining_button w-full"
          >
            Browse Cars
          </Button>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full"
          >
            Back to Homepage
          </Button>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Check your email to verify your account and unlock all features.
          </p>
        </div>
      </div>
    </div>
  );
}
