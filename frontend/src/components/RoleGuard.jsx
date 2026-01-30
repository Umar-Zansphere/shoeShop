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

    // If no user, redirect to login
    if (!storedUser) {
      console.log("No authenticated user found, redirecting to login");
      router.replace("/login");
      return;
    }

    // Check if user role is allowed
    if (!allowedRoles.includes(storedRole)) {
      console.log(
        `User role "${storedRole}" is not allowed. Required roles: ${allowedRoles.join(", ")}`
      );
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
