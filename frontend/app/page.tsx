/**
 * Landing page - redirects authenticated users to /tasks, unauthenticated to /signin.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, isTokenExpired } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();

    if (token && !isTokenExpired(token)) {
      // Authenticated user - redirect to tasks
      router.push("/tasks");
    } else {
      // Unauthenticated user - redirect to signin
      router.push("/signin");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
        <p className="mt-2 text-gray-600">Redirecting you to the app</p>
      </div>
    </div>
  );
}
