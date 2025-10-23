
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserProfiles } from "@/hooks/use-user-profiles";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { initiateAnonymousSignIn } from "@/firebase";
import { useAuth as useFirebaseAuth } from "@/firebase";


interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { profiles, loading: profilesLoading } = useUserProfiles();
  const [selectedProfile, setSelectedProfile] = React.useState<string>("");
  const { user, login } = useAuth();
  const auth = useFirebaseAuth();

  React.useEffect(() => {
    if (profiles && profiles.length > 0 && !selectedProfile) {
        setSelectedProfile(profiles[0].id);
    }
  }, [profiles, selectedProfile]);


  const handleLogin = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    if (!user) {
        initiateAnonymousSignIn(auth);
    }
    // The onAuthStateChanged listener in AuthProvider will handle the user state change
    // and we can then proceed with login. We will wait for the user object to be available.
  };

  React.useEffect(() => {
    if (user && isLoading) {
      login(selectedProfile).finally(() => setIsLoading(false));
    }
  }, [user, isLoading, login, selectedProfile]);

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleLogin}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Select onValueChange={setSelectedProfile} defaultValue={selectedProfile} value={selectedProfile}>
              <SelectTrigger disabled={profilesLoading}>
                <SelectValue placeholder={profilesLoading ? "Loading roles..." : "Select a role"} />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button disabled={isLoading || profilesLoading || !selectedProfile}>
            {(isLoading || profilesLoading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In As Role
          </Button>
        </div>
      </form>
    </div>
  );
}
