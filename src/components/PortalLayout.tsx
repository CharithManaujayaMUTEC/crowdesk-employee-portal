"use client";

import RequireAuth from "@/components/RequireAuth";
import PortalShell from "@/components/PortalShell";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth><PortalShell>{children}</PortalShell></RequireAuth>;
}
