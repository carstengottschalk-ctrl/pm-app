import type { Metadata } from "next";
import "./globals.css";
import { NavigationHeader } from "@/components/navigation-header";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Project Manager",
  description: "Project management app with time tracking and budget control",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <NavigationHeader />
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
