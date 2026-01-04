"use client";

import { BookingStatus, PaymentStatus, BookingResponseDto } from "@repo/dto";

interface BookingStatusTrackerProps {
  booking: BookingResponseDto;
  onStatusChange?: (newStatus: BookingStatus) => void;
}

const statusFlow: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.CHECKED_IN,
  BookingStatus.CHECKED_OUT,
];

const statusLabels: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "Pending",
  [BookingStatus.CONFIRMED]: "Confirmed",
  [BookingStatus.CHECKED_IN]: "Checked In",
  [BookingStatus.CHECKED_OUT]: "Checked Out",
  [BookingStatus.CANCELLED]: "Cancelled",
};

const statusDescriptions: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "Booking request is awaiting confirmation",
  [BookingStatus.CONFIRMED]: "Booking has been confirmed and payment is processed",
  [BookingStatus.CHECKED_IN]: "Guest has checked in",
  [BookingStatus.CHECKED_OUT]: "Guest has checked out",
  [BookingStatus.CANCELLED]: "Booking has been cancelled",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "Payment Pending",
  [PaymentStatus.COMPLETED]: "Payment Completed",
  [PaymentStatus.FAILED]: "Payment Failed",
  [PaymentStatus.REFUNDED]: "Payment Refunded",
};

const paymentStatusDescriptions: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "Payment is being processed",
  [PaymentStatus.COMPLETED]: "Payment has been successfully completed",
  [PaymentStatus.FAILED]: "Payment processing failed",
  [PaymentStatus.REFUNDED]: "Payment has been refunded",
};

export function BookingStatusTracker({ booking, onStatusChange }: BookingStatusTrackerProps) {
  const currentStatusIndex = statusFlow.indexOf(booking.status);
  const isCancelled = booking.status === BookingStatus.CANCELLED;

  const getStatusColor = (status: BookingStatus, currentIndex: number, isActive: boolean) => {
    if (isCancelled) return "bg-red-100 text-red-700 border-red-200";

    if (isActive) {
      return "bg-orange-500 text-white border-orange-500";
    }

    if (currentIndex < currentStatusIndex) {
      return "bg-green-100 text-green-700 border-green-200";
    }

    return "bg-slate-100 text-slate-500 border-slate-200";
  };

  const getConnectorColor = (index: number) => {
    if (isCancelled) return "bg-red-200";

    if (index < currentStatusIndex) {
      return "bg-green-400";
    }

    return "bg-slate-200";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Booking Status</h3>

        {isCancelled ? (
          <div className="flex items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-center">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-red-800 font-semibold text-lg">Cancelled</p>
              <p className="text-red-600 text-sm mt-1">{statusDescriptions[BookingStatus.CANCELLED]}</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center justify-between">
              {statusFlow.map((status, index) => {
                const isActive = status === booking.status;
                const isCompleted = index < currentStatusIndex;

                return (
                  <div key={status} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-all ${getStatusColor(status, index, isActive)}`}
                    >
                      {isCompleted ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-700 mt-2 text-center">
                      {statusLabels[status]}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="absolute top-6 left-0 right-0 -z-10 flex px-6">
              {statusFlow.slice(0, -1).map((_, index) => (
                <div
                  key={index}
                  className={`h-0.5 flex-1 mx-1 ${getConnectorColor(index)} transition-colors`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <p className="text-sm font-medium text-slate-900">
            Current Status: {statusLabels[booking.status]}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {statusDescriptions[booking.status]}
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Status</h3>

        <div className="flex items-center gap-4">
          <div
            className={`px-4 py-2 rounded-full border ${
              booking.paymentStatus === PaymentStatus.COMPLETED
                ? "bg-green-100 text-green-700 border-green-200"
                : booking.paymentStatus === PaymentStatus.FAILED
                ? "bg-red-100 text-red-700 border-red-200"
                : booking.paymentStatus === PaymentStatus.REFUNDED
                ? "bg-slate-100 text-slate-700 border-slate-200"
                : "bg-yellow-100 text-yellow-700 border-yellow-200"
            }`}
          >
            <span className="font-medium text-sm">
              {paymentStatusLabels[booking.paymentStatus]}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-3">
          {paymentStatusDescriptions[booking.paymentStatus]}
        </p>

        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Total Amount:</span>
            <span className="font-semibold text-slate-900">${booking.totalPrice}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Booking Timeline</h3>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <div className="w-0.5 flex-1 bg-slate-200 min-h-[2rem]" />
            </div>
            <div className="flex-1 pb-4">
              <p className="text-sm font-medium text-slate-900">Booking Created</p>
              <p className="text-xs text-slate-500">
                {new Date(booking.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {booking.status !== BookingStatus.PENDING && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                {booking.status !== BookingStatus.CONFIRMED && (
                  <div className="w-0.5 flex-1 bg-slate-200 min-h-[2rem]" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm font-medium text-slate-900">Booking Confirmed</p>
                <p className="text-xs text-slate-500">
                  {booking.status === BookingStatus.CONFIRMED
                    ? "Booking confirmed and ready"
                    : booking.status === BookingStatus.CHECKED_IN
                    ? "Guest has checked in"
                    : "Booking completed"}
                </p>
              </div>
            </div>
          )}

          {booking.status === BookingStatus.CHECKED_IN && (
            <div className="flex gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Guest Checked In</p>
                <p className="text-xs text-slate-500">Guest has arrived</p>
              </div>
            </div>
          )}

          {booking.status === BookingStatus.CHECKED_OUT && (
            <div className="flex gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Guest Checked Out</p>
                <p className="text-xs text-slate-500">Booking completed</p>
              </div>
            </div>
          )}

          {booking.status === BookingStatus.CANCELLED && (
            <div className="flex gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700">Booking Cancelled</p>
                <p className="text-xs text-slate-500">Booking was cancelled</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
