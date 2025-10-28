
"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronsUpDown, LogOut, Clock, Settings, Play, Pause, RefreshCw, ChevronLeft, ChevronRight, Coffee, ShieldQuestion, RotateCcw, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "../ui/sidebar";
import { useGameState } from "@/hooks/use-game-data";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { useUserProfiles } from "@/hooks/use-user-profiles";
import { useTasks } from "@/hooks/use-tasks";
import { useTeamSettings } from "@/hooks/use-team-settings";
import type { RoleFilter } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const getPageTitle = (pathname: string): string => {
    const segment = pathname.split("/").pop() || "dashboard";
    switch (segment) {
      case "dashboard":
        return "Dashboard";
      case "key-metrics":
        return "Key Metrics";
      case "master-data":
        return "Reference & Master Data";
      case "live-inventory":
        return "Live Inventory Tracker (LIT)";
      case "action-items":
        return "Tasks";
      case "roles":
        return "Role Views";
      case "competitor-log":
        return "Competitor Log";
      case "settings":
        return "Settings";
      default:
        return "ERPsim";
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

export function Header() {
  const { profile, logout, login } = useAuth();
  const { profiles: userProfiles } = useUserProfiles();
  const {
    gameState,
    timeLeft, 
    isPaused, 
    isBreakActive,
    isBreakEnabled,
    roundDuration,
    breakDuration,
    confirmNextRound,
    togglePause, 
    resetTimer, 
    resetGame,
    setRound,
    setRoundDuration,
    setBreakDuration,
    setIsBreakEnabled,
    setConfirmNextRound
  } = useGameState();
  const { roleFilter, setRoleFilter, isLoading: tasksLoading } = useTasks();
  const { teamLeader } = useTeamSettings();
  const pathname = usePathname();
  const [isResetDialogOpen, setIsResetDialogOpen] = React.useState(false);

  const pageTitle = getPageTitle(pathname);
  const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;
  const canViewAllRoles = Boolean(
    profile &&
    (profile.id === teamLeader || profile.id === "instructor" || profile.name === "Instructor")
  );

  const roleOptions: RoleFilter[] = React.useMemo(() => {
    if (canViewAllRoles) {
      return ["All", "Team Leader", "Sales", "Production", "Procurement", "Logistics"];
    }

    if (profile?.name) {
      return [profile.name as RoleFilter];
    }

    return ["All"];
  }, [canViewAllRoles, profile?.name]);

  const handleRoundDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value, 10);
    if (!isNaN(minutes)) {
        setRoundDuration(minutes * 60);
    }
  };

  const handleBreakDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value, 10);
    if (!isNaN(minutes)) {
        setBreakDuration(minutes * 60);
    }
  };

  const handleProfileSwitch = (profileId: string) => {
    if (profileId && profileId !== profile?.id) {
        login(profileId);
    }
  }

  const handleResetGame = async () => {
    await resetGame();
    setIsResetDialogOpen(false);
  }


  return (
    <>
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
       <div className="md:hidden">
          <SidebarTrigger />
        </div>
      <h1 className="text-xl font-semibold md:text-2xl font-headline hidden md:block">{pageTitle}</h1>

      <div className="flex items-center gap-2 ml-auto">
        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm font-medium">
            <span className="font-semibold">{isBreakActive ? 'Break' : `Round ${currentRound}`}</span>
            <span className="text-muted-foreground">|</span>
            {isBreakActive ? <Coffee className="h-4 w-4 text-muted-foreground" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
            <span>{formatTime(timeLeft)}</span>
        </div>
        {roleOptions.length > 0 && (
          <div className="hidden flex-col gap-1 md:flex">
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Users className="h-3 w-3" />
              Task View
            </span>
            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value as RoleFilter)}
              disabled={!canViewAllRoles || tasksLoading}
            >
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "All" ? "All Roles" : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Game Controls</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={togglePause}>
                    {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                    <span>{isPaused ? 'Resume Timer' : 'Pause Timer'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={resetTimer}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Reset Timer</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => setIsResetDialogOpen(true)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    <span>Reset Game</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Round Control</DropdownMenuLabel>
                 <div className="flex items-center justify-between px-2 py-1.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setRound(currentRound - 1)} disabled={currentRound <= 1}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">Round {currentRound}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setRound(currentRound + 1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                 </div>
                 <DropdownMenuSeparator />
                 <DropdownMenuLabel>Timer Settings</DropdownMenuLabel>
                 <div className="grid gap-4 px-2 py-1.5">
                    <div className="grid grid-cols-3 items-center gap-2">
                        <Label htmlFor="round-duration" className="text-sm">Round (m)</Label>
                        <Input id="round-duration" type="number" className="col-span-2 h-8" value={roundDuration / 60} onChange={handleRoundDurationChange}/>
                    </div>
                     <div className="grid grid-cols-3 items-center gap-2">
                        <Label htmlFor="break-duration" className="text-sm">Break (m)</Label>
                        <Input id="break-duration" type="number" className="col-span-2 h-8" value={breakDuration / 60} onChange={handleBreakDurationChange} disabled={!isBreakEnabled} />
                    </div>
                     <div className="flex items-center justify-between">
                         <Label htmlFor="break-enabled" className="text-sm">Enable Breaks</Label>
                         <Switch id="break-enabled" checked={isBreakEnabled} onCheckedChange={setIsBreakEnabled} />
                     </div>
                     <div className="flex items-center justify-between">
                         <Label htmlFor="confirm-next-round" className="text-sm flex items-center gap-1">
                            <ShieldQuestion className="h-3 w-3" />
                            Confirm Next Round
                        </Label>
                         <Switch id="confirm-next-round" checked={confirmNextRound} onCheckedChange={setConfirmNextRound} />
                     </div>
                 </div>
            </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatarUrl} alt={profile?.name} />
                <AvatarFallback>{profile?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">{profile?.name}</span>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={profile?.id} onValueChange={handleProfileSwitch}>
              {userProfiles.map((p) => (
                <DropdownMenuRadioItem key={p.id} value={p.id}>
                  {p.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently reset all game data,
            including KPI history, tasks, and settings, to their initial state.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleResetGame} className="bg-destructive hover:bg-destructive/90">
            Yes, reset game
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
