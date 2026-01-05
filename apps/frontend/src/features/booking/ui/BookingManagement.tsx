"use client";

import { useState, useMemo } from "react";
import { BookingResponseDto, BookingStatus } from "@repo/dto";

interface BookingManagementProps {
  bookings: BookingResponseDto[];
  loading?: boolean;
  onEdit?: (booking: BookingResponseDto) => void;
  onDelete?: (id: string) => void;
  onCancel?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onCheckIn?: (id: string) => void;
  onCheckOut?: (id: string) => void;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  [BookingStatus.PENDING]: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
  [BookingStatus.CONFIRMED]: { bg: "bg-blue-100", text: "text-blue-700", label: "Confirmed" },
  [BookingStatus.COMPLETED]: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
  [BookingStatus.CANCELLED]: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
};

export function BookingManagement({
  bookings,
  loading = false,
  onEdit,
  onDelete,
  onCancel,
  onConfirm,
  onCheckIn,
  onCheckOut,
}: BookingManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "">("");

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        searchQuery === "" ||
        booking.property?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.user?.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  const getAvailableActions = (booking: BookingResponseDto) => {
    const actions = [];

    if (booking.status === BookingStatus.PENDING) {
      actions.push({ label: "Confirm", key: "confirm", icon: "✓", color: "text-green-600" });
      actions.push({ label: "Cancel", key: "cancel", icon: "✕", color: "text-red-600" });
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      actions.push({ label: "Check In", key: "checkIn", icon: "→", color: "text-blue-600" });
      actions.push({ label: "Cancel", key: "cancel", icon: "✕", color: "text-red-600" });
    }

    actions.push({ label: "Edit", key: "edit", icon: "✎", color: "text-slate-600" });
    actions.push({ label: "Delete", key: "delete", icon: "🗑", color: "text-red-600" });

    return actions;
  };

  const handleAction = (actionKey: string, booking: BookingResponseDto) => {
    switch (actionKey) {
      case "edit":
        onEdit?.(booking);
        break;
      case "delete":
        if (confirm("Are you sure you want to delete this booking?")) {
          onDelete?.(booking.id);
        }
        break;
      case "cancel":
        if (confirm("Are you sure you want to cancel this booking?")) {
          onCancel?.(booking.id);
        }
        break;
      case "confirm":
        onConfirm?.(booking.id);
        break;
      case "checkIn":
        onCheckIn?.(booking.id);
        break;
      case "checkOut":
        onCheckOut?.(booking.id);
        break;
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 shadow-sm">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (filteredBookings.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 shadow-sm">
        <div className="text-center">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No bookings found</h3>
          <p className="text-slate-600">
            {searchQuery || statusFilter ? "Try adjusting your filters" : "Get started by creating a booking"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by property, guest name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "")}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors text-sm bg-white"
          >
            <option value="">All Statuses</option>
            {Object.entries(statusColors).map(([status, { label }]) => (
              <option key={status} value={status}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Guests
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">
                      {booking.property?.title || "N/A"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {booking.property?.address || ""}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">
                      {booking.user?.name || "N/A"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {booking.user?.email || ""}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900">
                      {new Date(booking.startDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(booking.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-900">{booking.totalGuests}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-900">
                      ${booking.totalPrice}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {statusColors[booking.status] ? (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[booking.status].bg
                        } ${statusColors[booking.status].text}`}
                      >
                        {statusColors[booking.status].label}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 capitalize">{booking.status.toLowerCase()}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {getAvailableActions(booking).map((action) => (
                        <button
                          key={action.key}
                          onClick={() => handleAction(action.key, booking)}
                          className={`p-1.5 hover:bg-slate-100 rounded transition-colors ${action.color}`}
                          title={action.label}
                        >
                          <span className="text-sm">{action.icon}</span>
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-slate-600 text-center">
        Showing {filteredBookings.length} of {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
