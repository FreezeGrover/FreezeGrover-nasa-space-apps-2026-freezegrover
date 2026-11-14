import type { Metadata } from "next";
import "@fontsource/kalam/400.css";
import "@fontsource/kalam/700.css";
import "./globals.css";
export const metadata: Metadata = {
  title: "Flames in Free Fall",
  description: "Combustion Research Dashboard — NASA Space Apps",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Browser assistive extensions add attributes to this element before hydration.
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
