"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronLeft, Plus, Minus } from "lucide-react";
import { useParams } from "next/navigation";
import axios from "axios";
import Header from "@/components/Header";
import { toast } from "react-hot-toast";

/* -------------------------------------------------
   Helper: format ISO date → "Oct 29"
   ------------------------------------------------- */
const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/* -------------------------------------------------
   Skeleton while loading
   ------------------------------------------------- */
function BookingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-6 bg-gray-300 rounded w-32" />
            <div className="h-72 bg-gray-300 rounded-2xl" />
            <div className="h-8 bg-gray-300 rounded w-48" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
            <div className="h-20 bg-gray-100 rounded-xl" />
            <div className="h-32 bg-gray-100 rounded-xl" />
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 h-64 space-y-4">
              <div className="h-5 bg-gray-200 rounded w-32" />
              <div className="h-5 bg-gray-200 rounded w-24" />
              <div className="h-5 bg-gray-200 rounded w-28" />
              <div className="h-10 bg-gray-200 rounded-full w-full mt-4" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ExperienceBooking() {
  const params = useParams();
  const { id } = params;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchExp = async () => {
      try {
        setLoading(true);
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || "";
        const res = await axios.get(`${base}/api/experiences/${id}`);
        const exp = res.data.data;

        setData(exp);

        if (exp.availableDates?.length) {
          const first = exp.availableDates[0];
          setSelectedDate(first);
          const firstAvailable = first.slots.find(
            (s) => s.available > s.booked
          );
          if (firstAvailable) setSelectedSlot(firstAvailable);
        }
      } catch (e) {
        setError(e.message || "Failed to load experience.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchExp();
  }, [id]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const firstAvailable = date.slots.find((s) => s.available > s.booked);
    setSelectedSlot(firstAvailable || null);
  };

  const updateQuantity = (delta) => {
    const newQty = quantity + delta;

    // Prevent going below 1
    if (newQty < 1) {
      toast.error("Minimu one quantity will be", {
        duration: 4000,
        style: { background: "#fef3c7", color: "#92400e", fontWeight: "500" },
      });
      return;
    }

    // Increasing – check available spots
    if (selectedSlot) {
      const spotsLeft = selectedSlot.available - selectedSlot.booked;
      if (newQty > spotsLeft) {
        toast.error("No more slots available for this time.", {
          duration: 4000,
          style: { background: "#fef3c7", color: "#92400e", fontWeight: "500" },
        });
        return;
      }
    }

    setQuantity(newQty);
  };

  const subtotal = data?.price ? data.price * quantity : 0;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;
  useEffect(() => {
    setQuantity(1);
  }, [selectedDate?._id, selectedSlot?._id]);

  if (loading && !data) {
    return (
      <>
        <Header loading={true} />
        <BookingSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header loading={false} />
        <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">
          {error}
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Header loading={false} />
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Experience not found.
        </div>
      </>
    );
  }

  const {
    title,
    location,
    description,
    price,
    image,
    availableDates = [],
    highlights = [],
    included = [],
    notIncluded = [],
    duration,
    rating,
    reviewCount,
  } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header loading={loading} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <Link
              href="/experiences"
              className="flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Experiences
            </Link>

            <div className="relative h-72 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {rating && (
                <div className="text-sm text-gray-600">
                  {rating} ({reviewCount} reviews)
                </div>
              )}
            </div>

            <p className="text-sm text-gray-500">{location}</p>
            <p className="text-gray-600 text-sm leading-relaxed">
              {description}
            </p>

            {/* DATE PICKER */}
            {availableDates.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Choose date
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableDates.map((d) => {
                    const pretty = formatDate(d.date);
                    const isSelected = selectedDate?._id === d._id;
                    return (
                      <button
                        key={d._id}
                        onClick={() => handleDateChange(d)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                          isSelected
                            ? "bg-yellow-400 text-gray-900"
                            : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {pretty}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TIME PICKER */}
            {selectedDate && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Choose time
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDate.slots.map((slot) => {
                    const spotsLeft = slot.available - slot.booked;
                    const isSoldOut = spotsLeft <= 0;
                    const isSelected = selectedSlot?._id === slot._id;

                    return (
                      <button
                        key={slot._id}
                        disabled={isSoldOut}
                        onClick={() => !isSoldOut && setSelectedSlot(slot)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                          isSelected
                            ? "bg-gray-800 text-white"
                            : isSoldOut
                            ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                            : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {slot.time}
                        <span
                          className={`ml-1 text-xs ${
                            isSoldOut ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          (
                          {isSoldOut
                            ? "Sold out"
                            : `${spotsLeft} spot${
                                spotsLeft > 1 ? "s" : ""
                              } left`}
                          )
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  All times are in IST
                </p>
              </div>
            )}

            {/* HIGHLIGHTS + INCLUDED/NOT INCLUDED – RESPONSIVE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* HIGHLIGHTS – Full width on mobile, 2 cols on md, 3 cols on lg */}
              {highlights.length > 0 && (
                <div className="">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Highlights
                  </h3>
                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                    {highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* INCLUDED */}
              {included.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Included
                  </h3>
                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                    {included.map((i, idx) => (
                      <li key={idx}>{i}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* NOT INCLUDED */}
              {notIncluded.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Not Included
                  </h3>
                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                    {notIncluded.map((i, idx) => (
                      <li key={idx}>{i}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 sticky top-24">
              <div className="space-y-4 text-sm">
                {/* Price per person */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per person</span>
                  <span className="font-bold text-gray-900">₹{price}</span>
                </div>

                {/* Quantity */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quantity</span>
                  <div className="flex items-center border border-gray-300 rounded-full">
                    <button
                      onClick={() => updateQuantity(-1)}
                      className="p-1.5 hover:bg-gray-100 transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4 text-gray-700" />
                    </button>
                    <span className="px-4 font-medium text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(1)}
                      className="p-1.5 hover:bg-gray-100 transition"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold text-gray-900">₹{subtotal}</span>
                </div>

                {/* Taxes 18% */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes (18%)</span>
                  <span className="font-bold text-gray-900">₹{tax}</span>
                </div>

                {/* TOTAL */}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-base font-bold text-gray-900">
                    Total
                  </span>
                  <span className="text-base font-bold text-gray-900">
                    ₹{total}
                  </span>
                </div>
              </div>

              {/* BOOKING BUTTON */}
              <Link
                href={
                  selectedSlot
                    ? `/experiences/${id}/checkout?date=${selectedDate.date}&slot=${selectedSlot.time}&quantity=${quantity}`
                    : "#"
                }
                className={`mt-6 flex w-full items-center justify-center rounded-full py-3 font-medium transition ${
                  selectedSlot
                    ? "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {selectedSlot ? "Confirm Booking" : "Select a time"}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
