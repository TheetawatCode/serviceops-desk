import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppShell } from "@/components/app-shell";
import { RoleProvider } from "@/components/role-provider";
import { getActiveDemoIdentity } from "@/lib/demo-identity.server";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ServiceOps Desk",
    template: "%s · ServiceOps Desk",
  },
  description: "A role-based service operations workspace for managing internal jobs.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const identity = await getActiveDemoIdentity();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <RoleProvider initialIdentity={identity}>
          <AppShell>{children}</AppShell>
        </RoleProvider>
      </body>
    </html>
  );
}
