"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
  }, [ready, user, router, pathname]);

  if (!ready || !user) return <div className="loading-screen"><div className="loading-logo">C</div><div className="spinner" /><p>Preparing your workspace…</p></div>;
  return <>{children}</>;
}
