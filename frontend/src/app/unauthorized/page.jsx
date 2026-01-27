"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UnauthorizedPage() {
  const router = useRouter();

  // Go back to the previous page in history
  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/"); // fallback if no history
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 text-gray-800 p-6">
      <div className="bg-white shadow-2xl rounded-3xl p-10 text-center max-w-md">
        {/* Playful illustration: collaboration idea */}
        <svg
          className="w-32 h-32 mx-auto mb-6 text-pink-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 64 64"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="32" cy="32" r="30" strokeOpacity="0.2" />
          <path
            d="M20 28 L44 36 M44 28 L20 36"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <h1 className="text-3xl font-bold mb-2">Oops! Access Denied</h1>
        <p className="mb-6 text-gray-600">
          Looks like this page or feature isn’t available for your account.
          Maybe it’s meant for a different role.
        </p>

        <button
          onClick={handleGoBack}
          className="px-8 py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 transition"
        >
          Go Back
        </button>

        <p className="mt-6 text-sm text-gray-400">
          If you think this is an error, reach out to our support team.
        </p>
      </div>
    </div>
  );
}
