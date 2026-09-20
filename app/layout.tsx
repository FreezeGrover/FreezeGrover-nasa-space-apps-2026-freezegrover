import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FREEZGROVER | From Questions to Discovery",
  description:
    "AI-powered exploration of NASA microgravity combustion research for safer human spaceflight.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
