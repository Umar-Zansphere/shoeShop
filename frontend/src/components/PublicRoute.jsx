"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export default function PublicRoute({ children }) {
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("fullName");
    const storedRole = localStorage.getItem("userRole");

    if (storedUser) {
      // User is authenticated, redirect based on role
      if (storedRole === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
      return;
    }

    // User is not authenticated, allow access to public route
    setIsPublic(true);
    setLoading(false);
  }, [router]);

  if (loading) return <LoadingSkeleton />;

  return isPublic ? children : null;
}
