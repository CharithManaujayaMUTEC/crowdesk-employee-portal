import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Crow Desk", template: "%s | Crow Desk" },
  description: "Crow.lk employee workspace for attendance, leave, tasks and approvals.",
  applicationName: "Crow Desk",
  referrer: "strict-origin-when-cross-origin",
  icons: { icon: "/crow-logo.png", shortcut: "/crow-logo.png" }
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#080808" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AuthProvider>{children}</AuthProvider></body></html>;
}
