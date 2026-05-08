"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { applyFirstOrderDiscount } from "@/api/discount.api";
import { useGuestDiscount } from "@/hooks/useGuestDiscount";

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return error instanceof Error ? error.message : "An error occurred. Please try again.";
}

export default function DiscountPill() {
  const [visible, setVisible] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { setGuestDiscount } = useGuestDiscount();

  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await applyFirstOrderDiscount(email);
      
      if (response.success) {
        setSuccess(true);
        
        // Store only the server claim token. The reusable coupon code stays server-side.
        setGuestDiscount({
          claimToken: response.data.claim_token,
          email: email, // Store email with discount
          discountId: response.data.discount_id,
          discountType: response.data.discount_type,
          discountAmount: response.data.discount_amount,
          expiresAt: response.data.expires_at,
          appliedAt: new Date().toISOString(),
        });
        
        // Auto-close modal after 5 seconds
        setTimeout(() => {
          setShowModal(false);
          setEmail("");
          setSuccess(false);
        }, 5000);
      } else {
        setError(response.message || "Failed to apply discount");
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.18)] border border-gray-100">
          <button
            onClick={() => setShowModal(true)}
            className="font-['Inter'] font-semibold text-sm text-black hover:opacity-60 transition-opacity cursor-pointer"
          >
            Get 20% Off
          </button>
          <button
            aria-label="Dismiss"
            onClick={() => setVisible(false)}
            className="w-5 h-5 flex items-center justify-center text-black hover:opacity-50 transition-opacity cursor-pointer"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-8 shadow-lg">
            {success ? (
              <div className="text-center">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-6" />
                  <div className="flex-1 text-center">
                    <div className="flex justify-center mb-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-black mb-2">20% Off Saved</p>
                    <p className="text-gray-600 text-sm">Log in with this email to use it at checkout.</p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-black">Get 20% Off</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <p className="text-gray-600 mb-6">
                  Enter your email to receive your exclusive 20% discount code for your first order.
                </p>

                <form onSubmit={handleApplyDiscount} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />

                  {error && (
                    <p className="text-red-600 text-sm">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending..." : "Get Discount Code"}
                  </button>
                </form>

                <p className="text-xs text-gray-500 text-center mt-4">
                  This discount is only available once per email address and cannot be combined with other promo codes.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
