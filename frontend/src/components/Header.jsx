"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Loader2, Menu, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const Header = ({ loading = false }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const urlSearch = searchParams.get("search") ?? "";
  const [inputValue, setInputValue] = useState(urlSearch);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync input with URL
  useEffect(() => {
    setInputValue(urlSearch);
    if (!urlSearch) setIsSearchOpen(false);
  }, [urlSearch]);

  const performSearch = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const newParams = new URLSearchParams();
    newParams.set("search", trimmed);
    router.push(`/experiences?${newParams.toString()}`);
    setIsSearchOpen(false); // Close on mobile after search
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") performSearch();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <Link href="/experiences" className="flex items-center space-x-2">
            <div className="bg-yellow-600 text-white rounded-full w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-base sm:text-lg font-bold pl-0.5">
              HD
            </div>
            <span className=" sm:inline text-lg sm:text-xl font-bold text-gray-900">
              Highway Delite
            </span>
          </Link>

          {/* DESKTOP: Full Search Bar */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-8">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-full">
              <Search className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search Experiences"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent outline-none text-sm flex-1 text-gray-700 placeholder-gray-500"
              />
            </div>

            <div className="relative">
              <button
                onClick={performSearch}
                disabled={loading}
                className={`
                  relative z-10 bg-yellow-500 hover:bg-yellow-600 text-black font-medium
                  rounded px-5 py-2 transition disabled:opacity-50 disabled:cursor-not-allowed
                  ${loading ? "invisible" : "visible"}
                `}
              >
                Search
              </button>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                </div>
              )}
            </div>
          </div>

          {/* MOBILE: Search Toggle + Menu */}
          <div className="flex items-center gap-3 md:hidden">
            {/* Search Toggle Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Toggle search"
            >
              {isSearchOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Search className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE: Full-width Search Bar (when open) */}
        {isSearchOpen && (
          <div className="md:hidden pb-3 -mx-4 px-4 bg-white border-t border-gray-100 animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 flex-1">
                <Search className="w-5 h-5 text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search Experiences"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="bg-transparent outline-none text-sm flex-1 text-gray-700 placeholder-gray-500"
                />
              </div>

              <div className="relative">
                <button
                  onClick={performSearch}
                  disabled={loading}
                  className={`
                    relative z-10 bg-yellow-500 hover:bg-yellow-600 text-black font-medium
                    rounded px-4 py-2 text-sm transition disabled:opacity-50
                    ${loading ? "invisible" : "visible"}
                  `}
                >
                  Go
                </button>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
