import type { Metadata } from "next";
import "./globals.css";
import { NavigationHeader } from "@/components/navigation-header";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";

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
        <Providers>
          <NavigationHeader />
          <main>{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
