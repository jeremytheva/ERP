
import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { TeamSettingsProvider } from "@/hooks/use-team-settings";
import { TasksProvider } from "@/hooks/use-tasks";
import { GameStateProvider } from "@/hooks/use-game-data";
import { CompetitorLogProvider } from "@/hooks/use-competitor-log";
import { FirebaseClientProvider } from "@/firebase";
import { UserProfilesProvider } from "@/hooks/use-user-profiles";

export const metadata: Metadata = {
  title: "ERPsim Dashboard",
  description: "A dashboard for the ERPsim business simulation game.",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code-pro",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${sourceCodePro.variable} font-body antialiased`} suppressHydrationWarning>
        <FirebaseClientProvider>
          <AuthProvider>
            <UserProfilesProvider>
              <TeamSettingsProvider>
                <GameStateProvider>
                  <TasksProvider>
                    <CompetitorLogProvider>
                      {children}
                      <Toaster />
                    </CompetitorLogProvider>
                  </TasksProvider>
                </GameStateProvider>
              </TeamSettingsProvider>
            </UserProfilesProvider>
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
