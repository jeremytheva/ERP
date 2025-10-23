
import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";

export const metadata: Metadata = {
  title: "ERPsim Dashboard",
  description: "A dashboard for the ERPsim business simulation game.",
};

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: "--font-inter",
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  display: 'swap',
  variable: "--font-source-code-pro",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${sourceCodePro.variable} font-body antialiased`} suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
