import { UserAuthForm } from "@/components/auth/user-auth-form";
import { Bot } from "lucide-react";

export default function AuthenticationPage() {
  return (
    <main className="flex h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Bot className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight font-headline">
            Welcome to ERPsim Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Select your profile to continue
          </p>
        </div>
        <UserAuthForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          Sign in to access your team's real-time data and strategic tools.
        </p>
      </div>
    </main>
  );
}
