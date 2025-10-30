"use client";

import Link from "next/link";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft, Plus, Minus, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import axios from "axios";
import { toast } from "react-hot-toast";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const SummarySkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      ))}
    </div>
    <div className="h-10 bg-gray-300 rounded-full"></div>
  </div>
);

/* -------------------------------------------------
   Validation Helpers
   ------------------------------------------------- */
const validateName = (name) => name.trim().length >= 2;
const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const validatePhone = (phone) =>
  /^\+?\d{10,15}$/.test(phone.replace(/\s/g, ""));

export default function Checkout() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  /* ---------- READ ONLY FROM URL ---------- */
  const urlDate = searchParams.get("date");
  const urlSlot = decodeURIComponent(searchParams.get("slot") || "");
  const urlQty = Math.max(1, parseInt(searchParams.get("quantity") || "1", 10));

  /* ---------- STATE ---------- */
  const [exp, setExp] = useState(null);
  const [quantity, setQuantity] = useState(urlQty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [promo, setPromo] = useState("");
  const [promoData, setPromoData] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [agree, setAgree] = useState(false);

  // Button Loading States
  const [promoLoading, setPromoLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const updateQuantity = (delta) => {
    const newQty = quantity + delta;

    // Prevent going below 1
    if (newQty < 1) {
      toast.error("No more slots available for this time.", {
        duration: 4000,
        style: {
          background: "#fef3c7",
          color: "#92400e",
          fontWeight: "500",
        },
      });
      return;
    }

    // Increasing – check available spots
    if (exp && urlDate && urlSlot) {
      const dateObj = exp.availableDates.find((d) => d.date === urlDate);
      if (dateObj) {
        const slotObj = dateObj.slots.find((s) => s.time === urlSlot);
        if (slotObj) {
          const spotsLeft = slotObj.available - slotObj.booked;
          if (newQty > spotsLeft) {
            toast.error("No more slots available for this time.", {
              duration: 4000,
              style: {
                background: "#fef3c7",
                color: "#92400e",
                fontWeight: "500",
              },
            });
            return;
          }
        }
      }
    }

    setQuantity(newQty);
  };

  /* ---------- FETCH EXPERIENCE ---------- */
  useEffect(() => {
    const fetchExp = async () => {
      try {
        setLoading(true);
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || "";
        const { data } = await axios.get(`${base}/api/experiences/${id}`);
        setExp(data.data);
      } catch (e) {
        setError(e.message || "Failed to load experience.");
        toast.error("Failed to load experience details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchExp();
  }, [id]);

  /* ---------- APPLY PROMO ---------- */
  const applyPromo = async () => {
    if (!promo.trim()) {
      toast.error("Please enter a promo code.", {
        duration: 4000,
        style: {
          background: "#fef3c7",
          color: "#92400e",
          fontWeight: "500",
        },
      });
      return;
    }

    setPromoError("");
    setPromoData(null);
    setPromoLoading(true);

    try {
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || "";
      const { data } = await axios.post(
        `${base}/api/promo/validate`,
        {
          code: promo,
          experiencePrice: exp.price,
          numberOfPeople: quantity,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setPromoData(data.data);
      toast.success("Promo applied successfully!");
    } catch (e) {
      const msg =
        e.response?.data?.message || e.message || "Invalid promo code";
      setPromoError(msg);
      toast.error(msg, {
        duration: 4000,
        style: {
          background: "#fef3c7",
          color: "#92400e",
          fontWeight: "500",
        },
      });
    } finally {
      setPromoLoading(false);
    }
  };

  /* ---------- VALIDATE & BOOK ---------- */
  const handlePay = async () => {
    // Reset errors
    setPromoError("");

    // Validate required fields
    if (!name.trim()) return toast.error("Please enter your full name.");
    if (!validateName(name))
      return toast.error("Name must be at least 2 characters.");

    if (!email.trim()) return toast.error("Please enter your email.");
    if (!validateEmail(email))
      return toast.error("Please enter a valid email address.");

    if (!phone.trim()) return toast.error("Please enter your phone number.");
    if (!validatePhone(phone))
      return toast.error("Please enter a valid phone number (10-15 digits).");

    if (!agree)
      return toast.error("You must agree to the terms and safety policy.");

    if (!urlDate || !urlSlot) return toast.error("Date or time is missing.");

    setBookingLoading(true);

    const subtotal = exp.price * quantity;
    const discount = promoData ? promoData.discount : 0;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal - discount + tax;

    const payload = {
      experienceId: id,
      customerName: name.trim(),
      customerEmail: email.trim(),
      customerPhone: phone.replace(/\s/g, ""),
      selectedDate: urlDate,
      selectedSlot: urlSlot,
      numberOfPeople: quantity,
      promoCode: promo || null,
      totalPrice: total,
    };

    try {
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || "";
      const { data } = await axios.post(`${base}/api/bookings`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log(data);
      toast.success("Booking confirmed!");
      router.push(
        `/experiences/${id}/checkout/result?ref=${data.data.bookingReference}`
      );
    } catch (e) {
      console.log(e);
      toast.error(
        e.response?.data?.message || e.message || "Failed to complete booking."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  /* ---------- CALCULATE TOTAL ---------- */
  const calculateTotal = () => {
    if (!exp) return 0;
    const subtotal = exp.price * quantity;
    const discount = promoData ? promoData.discount : 0;
    const tax = Math.round(subtotal * 0.18);
    return subtotal - discount + tax;
  };

  const calculateTax = () => {
    if (!exp) return 0;
    return Math.round(exp.price * quantity * 0.18);
  };

  /* ---------- RENDER ---------- */
  if (error && !exp) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header loading={loading} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-red-600">{error}</div>
        </main>
      </div>
    );
  }

  if (!exp && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header loading={loading} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">Experience not found.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header loading={loading} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ---- LEFT: FORM ---- */}
          <div className="lg:col-span-2 space-y-6">
            <Link
              href={`/experiences/${id}`}
              className="flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to experience
            </Link>

            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
              {/* Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {/* Promo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Promo code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    disabled={promoLoading}
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                  />
                  <button
                    onClick={applyPromo}
                    disabled={loading || !exp || promoLoading}
                    className="px-6 py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {promoLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      "Apply"
                    )}
                  </button>
                </div>

                {promoData && (
                  <p className="text-xs text-green-600 mt-1">
                    {promoData.type === "percentage"
                      ? `${promoData.value}% off`
                      : `₹${promoData.value} flat off`}{" "}
                    → Discount: ₹{promoData.discount}
                  </p>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="w-5 h-5 text-yellow-400 rounded focus:ring-yellow-400"
                />
                <span className="text-xs text-gray-600">
                  I agree to the{" "}
                  <span className="text-yellow-600 underline">
                    terms and safety policy
                  </span>{" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
            </div>
          </div>

          {/* ---- RIGHT: SUMMARY ---- */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Experience
              </h3>

              {loading ? (
                <SummarySkeleton />
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{exp.title}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Date</span>
                    <span>{formatDate(urlDate)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Time</span>
                    <span>{urlSlot}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Qty</span>
                    <div className="flex items-center border border-gray-300 rounded-full">
                      <button
                        onClick={() => updateQuantity(-1)}
                        className="p-1.5 hover:bg-gray-100 transition"
                        disabled={bookingLoading}
                      >
                        <Minus className="w-4 h-4 text-gray-700" />
                      </button>
                      <span className="px-4 font-medium text-gray-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(1)}
                        className="p-1.5 hover:bg-gray-100 transition"
                        disabled={bookingLoading}
                      >
                        <Plus className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{exp.price * quantity}</span>
                  </div>

                  {promoData && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{promoData.discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Tax (18%)</span>
                    <span>₹{calculateTax()}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-base font-bold text-gray-900">
                      <span>Total</span>
                      <span>₹{calculateTotal()}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={bookingLoading || loading}
                className={`w-full mt-6 font-bold py-4 rounded-full transition text-base flex items-center justify-center gap-2 ${
                  !bookingLoading && agree && !loading
                    ? "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Confirming Booking...
                  </>
                ) : (
                  "Pay and Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
