"use client";

import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronsUpDown, LogOut, Clock, Settings, Play, Pause, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "../ui/sidebar";
import { useGameState } from "@/hooks/use-game-data";

const getPageTitle = (pathname: string): string => {
    const segment = pathname.split("/").pop() || "dashboard";
    switch (segment) {
      case "dashboard":
        return "Dashboard";
      case "scenario-planning":
        return "Scenario Planning";
      case "strategic-advisor":
        return "Strategic Advisor";
      case "debriefing":
        return "End-of-Round Debriefing";
      case "action-items":
        return "Action Items";
      case "competitor-log":
        return "Competitor Log";
      default:
        return "ERPsim";
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

export function Header() {
  const { profile, logout } = useAuth();
  const { gameState, roundTimeLeft, isPaused, togglePause, resetTimer, setRound } = useGameState();
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
       <div className="md:hidden">
          <SidebarTrigger />
        </div>
      <h1 className="text-xl font-semibold md:text-2xl font-headline hidden md:block">{pageTitle}</h1>

      <div className="flex items-center gap-2 ml-auto">
        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm font-medium">
            <span className="font-semibold">Round {currentRound}</span>
            <span className="text-muted-foreground">|</span>
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatTime(roundTimeLeft)}</span>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
            <DropdownMenuLabel>{profile?.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
