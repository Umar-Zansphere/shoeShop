"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export default function RoleGuard({ allowedRoles, children }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("fullName");
    const storedRole = localStorage.getItem("userRole") || "CUSTOMER";

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes(storedRole)) {
      router.replace("/unauthorized");
      return;
    }

    setUser(storedUser);
    setUserRole(storedRole);
    setLoading(false);
  }, [allowedRoles, router]);

  if (loading) return <LoadingSkeleton />;

  return children;
}
