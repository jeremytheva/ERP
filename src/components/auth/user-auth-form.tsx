
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
import { createAnonymousSession } from "@/lib/firebase/server-actions";


interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { profiles, loading: profilesLoading } = useUserProfiles();
  const [selectedProfile, setSelectedProfile] = React.useState<string>("");
  const { user, login } = useAuth();
  const auth = useFirebaseAuth();
  const [pendingRole, setPendingRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (profiles && profiles.length > 0 && !selectedProfile) {
        setSelectedProfile(profiles[0].id);
    }
  }, [profiles, selectedProfile]);


  const handleLogin = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (!auth || !selectedProfile) return;

    setIsLoading(true);

    try {
      await createAnonymousSession();

      if (!user) {
        setPendingRole(selectedProfile);
        initiateAnonymousSignIn(auth);
        return;
      }

      await login(selectedProfile);
      setIsLoading(false);
    } catch (error) {
      console.error("Anonymous sign-in failed", error);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (!user || !pendingRole) return;

    login(pendingRole)
      .catch((error) => {
        console.error("Role activation failed", error);
      })
      .finally(() => {
        setPendingRole(null);
        setIsLoading(false);
      });
  }, [user, pendingRole, login]);

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
