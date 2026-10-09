"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function HomePage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  useEffect(() => { if (ready) router.replace(user ? "/dashboard" : "/login"); }, [ready, user, router]);
  return <div className="loading-screen"><div className="loading-logo">C</div><div className="spinner" /><p>Opening Crow Desk…</p></div>;
}
