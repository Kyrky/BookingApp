"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { cardStorage, type StoredCard } from "@/shared/storage/cardStorage";
import type { BookingResponseDto } from "@repo/dto";

interface PaymentManagementProps {
  bookings?: BookingResponseDto[];
}

interface CardData {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
  type: "visa" | "mastercard" | "amex";
}

export function PaymentManagement({ bookings = [] }: PaymentManagementProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddCard, setShowAddCard] = useState(false);
  const [loading, setLoading] = useState(true);

  const [cardData, setCardData] = useState<CardData>({
    number: "",
    holder: "",
    expiry: "",
    cvv: "",
    type: "visa",
  });

  const [savedCards, setSavedCards] = useState<StoredCard[]>([]);

  useEffect(() => {
    loadCards();
  }, [user]);

  function loadCards() {
    setLoading(true);
    const cards = cardStorage.getCards();
    setSavedCards(cards);
    setLoading(false);
  }

  const pendingPayments = bookings.filter((b) => b.paymentStatus === "PENDING");
  const completedPayments = bookings.filter((b) => b.paymentStatus === "COMPLETED");
  const failedPayments = bookings.filter((b) => b.paymentStatus === "FAILED");

  const totalRevenue = completedPayments.reduce((sum, b) => sum + b.totalPrice, 0);
  const pendingRevenue = pendingPayments.reduce((sum, b) => sum + b.totalPrice, 0);

  const detectCardType = (number: string): "visa" | "mastercard" | "amex" => {
    if (/^4/.test(number)) return "visa";
    if (/^5/.test(number)) return "mastercard";
    if (/^3/.test(number)) return "amex";
    return "visa";
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const maskedNumber = cardData.number.replace(/\d(?=\d{4})/g, "•") || "••••••••••••";
    const newCard = cardStorage.addCard({
      number: maskedNumber,
      holder: cardData.holder,
      expiry: cardData.expiry,
      type: detectCardType(cardData.number),
    });

    setSavedCards([...savedCards, newCard]);
    setCardData({ number: "", holder: "", expiry: "", cvv: "", type: "visa" });
    setShowAddCard(false);
  };

  const handleDeleteCard = (cardId: string) => {
    cardStorage.deleteCard(cardId);
    setSavedCards(savedCards.filter((card) => card.id !== cardId));
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            From {completedPayments.length} completed payments
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                ${pendingRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            {pendingPayments.length} payments pending
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {completedPayments.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Successfully processed
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Failed</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {failedPayments.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Payment failures
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Payment Methods</h3>
              <button
                onClick={() => setShowAddCard(!showAddCard)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Card
              </button>
            </div>

            {showAddCard && (
              <div className="mb-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="text-md font-semibold text-slate-900 mb-4">Add New Card</h4>
                <form onSubmit={handleAddCard} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardData.number}
                      onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardData.holder}
                      onChange={(e) => setCardData({ ...cardData, holder: e.target.value.toUpperCase() })}
                      placeholder="JOHN DOE"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="password"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })}
                        placeholder="123"
                        maxLength={3}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium shadow-sm"
                    >
                      Save Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCard(false)}
                      className="px-4 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="p-12 text-center text-slate-500">Loading cards...</div>
            ) : savedCards.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No saved cards. Add your first payment method.
              </div>
            ) : (
              <div className="space-y-4">
                {savedCards.map((card) => (
                  <div
                    key={card.id}
                    className="relative overflow-hidden rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
                    style={{
                      background: card.type === "visa"
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : card.type === "mastercard"
                        ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                        : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    }}
                  >
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete card"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <div className="p-6 text-white">
                      <div className="flex justify-between items-start mb-8">
                        <div className="flex gap-2">
                          {card.type === "visa" && (
                            <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                              <rect width="48" height="32" rx="4" fill="#1A1F71" />
                              <text x="8" y="20" fill="white" fontSize="12" fontWeight="bold">VISA</text>
                            </svg>
                          )}
                          {card.type === "mastercard" && (
                            <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                              <rect width="48" height="32" rx="4" fill="#252525" />
                              <circle cx="18" cy="16" r="8" fill="#EB001B" />
                              <circle cx="30" cy="16" r="8" fill="#F79E1B" />
                            </svg>
                          )}
                          {card.type === "amex" && (
                            <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                              <rect width="48" height="32" rx="4" fill="#006FCF" />
                              <text x="6" y="20" fill="white" fontSize="10" fontWeight="bold">AMEX</text>
                            </svg>
                          )}
                        </div>
                        <svg className="w-8 h-8 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" opacity="0.3" />
                        </svg>
                      </div>
                      <div className="mb-4">
                        <p className="text-xl font-mono tracking-wider">
                          {card.number}
                        </p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-white/60 mb-1">Card Holder</p>
                          <p className="text-sm font-medium uppercase">{card.holder}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60 mb-1">Expires</p>
                          <p className="text-sm font-medium">{card.expiry}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
                <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                  View All
                </button>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="p-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No transactions yet</h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    When bookings are made and payments are processed, they will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          booking.paymentStatus === "COMPLETED"
                            ? "bg-green-100"
                            : booking.paymentStatus === "PENDING"
                            ? "bg-orange-100"
                            : "bg-red-100"
                        }`}>
                          {booking.paymentStatus === "COMPLETED" ? (
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : booking.paymentStatus === "PENDING" ? (
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {booking.property?.title || "Property"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(booking.createdAt).toLocaleDateString()} at{" "}
                            {new Date(booking.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          ${booking.totalPrice}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          booking.paymentStatus === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : booking.paymentStatus === "PENDING"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payment Settings */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Settings</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Credit Card Payments</p>
                    <p className="text-xs text-slate-500">Visa, Mastercard, Amex</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Active
                  </span>
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Bank Transfer</p>
                    <p className="text-xs text-slate-500">Direct bank payments</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Active
                  </span>
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Cash on Arrival</p>
                    <p className="text-xs text-slate-500">Pay when you arrive</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    Disabled
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>

            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-orange-300 transition-colors text-left">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Download Invoices</p>
                  <p className="text-xs text-slate-500">View all payment receipts</p>
                </div>
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button className="w-full flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-orange-300 transition-colors text-left">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Payment Security</p>
                  <p className="text-xs text-slate-500">Manage security settings</p>
                </div>
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button className="w-full flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-orange-300 transition-colors text-left">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Payment History</p>
                  <p className="text-xs text-slate-500">View all past transactions</p>
                </div>
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
