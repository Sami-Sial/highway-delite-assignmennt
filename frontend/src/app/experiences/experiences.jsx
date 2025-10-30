"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "@/components/Header";
import { useSearchParams, useRouter } from "next/navigation";

// Skeleton Card Componnt
function ExperienceSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
      <div className="relative h-48 bg-gray-300"></div>
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="space-y-1">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 rounded w-12"></div>
            <div className="h-6 bg-gray-300 rounded w-16"></div>
          </div>
          <div className="h-9 bg-gray-300 rounded-full w-28"></div>
        </div>
      </div>
    </div>
  );
}

export default function Experiences() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
        const search = searchParams.get("search")?.trim();

        // Build URL with optional search query
        const url = new URL(`${baseUrl}/api/experiences`);
        if (search) url.searchParams.append("search", search);

        const { data } = await axios.get(url.toString());

        console.log(data);
        setExperiences(data.data ?? []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header loading={loading} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="text-center py-10 text-red-600">Error: {error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? // Show 8 skeleton cards while loading
              Array(8)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="group block">
                    <ExperienceSkeleton />
                  </div>
                ))
            : experiences.map((exp) => (
                <Link
                  key={exp.id}
                  href={`/experiences/${exp._id}`}
                  className="group block"
                >
                  <div
                    className={`
                      bg-white rounded-lg overflow-hidden shadow-md
                      transition-all duration-300
                      group-hover:scale-[1.02] group-hover:shadow-2xl
                      group-hover:border group-hover:border-orange-400
                      focus:outline-none
                      ${
                        exp.highlighted
                          ? "ring-2 ring-orange-400 ring-offset-2"
                          : ""
                      }
                    `}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={exp.image}
                        alt={exp.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        unoptimized
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition">
                        {exp.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {exp.location}
                      </p>
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {exp.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-500">From</span>
                          <p className="text-xl font-bold text-gray-900">
                            ₹{exp.price}
                          </p>
                        </div>
                        <span className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium text-sm px-4 py-2 rounded transition">
                          View Details
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
        </div>

        {/* No results fallback */}
        {!loading && !error && experiences.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            No experiences found.
          </div>
        )}
      </main>
    </div>
  );
}
