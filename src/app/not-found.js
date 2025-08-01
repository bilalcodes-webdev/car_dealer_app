// app/not-found.tsx or pages/404.tsx
"use client";
// pages/404.tsx (Next.js Pages Router)
// or app/not-found.tsx (Next.js App Router)

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="max-w-md text-center">
        {/* SVG Illustration */}
        <div className="mb-6">
          <svg
            className="mx-auto h-48 w-48 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 9.75h.008v.008H9.75V9.75zm4.5 0h.008v.008h-.008V9.75zM12 16.5c-2.485 0-4.5-2.015-4.5-4.5h9c0 2.485-2.015 4.5-4.5 4.5zM3.75 3.75l16.5 16.5M3.75 20.25l16.5-16.5"
            />
          </svg>
        </div>

        {/* 404 Heading */}
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
          404 - Connection Lost
        </h1>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The page you are looking for isn’t reachable — maybe the internet
          broke... or the link is wrong.
        </p>

        {/* Button */}
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
