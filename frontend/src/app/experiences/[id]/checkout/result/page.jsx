"use client";

import Header from "@/components/Header";
import { Check, Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function BookingConfirmed() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content - Centered */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center space-y-6 max-w-md w-full">
          {/* Green Checkmark */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-12 h-12 text-green-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900">
            Booking Confirmed
          </h1>

          {/* Ref ID */}
          <p className=" text-gray-500">
            <span className="text-xl font-semibold">
              Ref Id: &nbsp; &nbsp;&nbsp;
            </span>
            <span className="font-mono font-medium">{ref}</span>
          </p>

          {/* Back to Home Button */}
          <Link
            href="/experiences"
            className="inline-block px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-sm rounded transition"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
