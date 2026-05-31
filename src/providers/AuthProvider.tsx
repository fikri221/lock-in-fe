"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { syncPushSubscription } from "@/lib/notifications";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      syncPushSubscription();
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}
