
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { USER_PROFILES } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { initiateAnonymousSignIn } from "@/firebase";
import { useAuth as useFirebaseAuth } from "@/firebase";


interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [selectedProfile, setSelectedProfile] = React.useState<string>(USER_PROFILES[0]?.id || "");
  const { user, login } = useAuth();
  const auth = useFirebaseAuth();


  const handleLogin = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    if (!user) {
        initiateAnonymousSignIn(auth);
    }
    await login(selectedProfile);
    setIsLoading(false);
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleLogin}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Select onValueChange={setSelectedProfile} defaultValue={selectedProfile}>
              <SelectTrigger>
                <SelectValue placeholder="Select a profile" />
              </SelectTrigger>
              <SelectContent>
                {USER_PROFILES.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button disabled={isLoading || !selectedProfile}>
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In
          </Button>
        </div>
      </form>
    </div>
  );
}
