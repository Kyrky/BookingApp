"use client";

import { useState, useEffect } from "react";
import { BookingCalendar, BookingStatusTracker } from "@/entities/booking";
import { BookingManagement, BookingForm } from "@/features/booking";
import { Modal, ToastContainer } from "@/shared/ui";
import { useToast } from "@/shared/ui/hooks/useToast";
import { bookingApi } from "@/shared/api";
import { useAuth } from "@/contexts/auth-context";
import type { BookingResponseDto, CreateBookingDto, UpdateBookingDto, BookingAvailabilityDto } from "@repo/dto";

type TabType = "list" | "calendar" | "status";
type ModalType = "booking" | "view" | null;

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("list");
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingBooking, setEditingBooking] = useState<BookingResponseDto | null>(null);
  const [viewingBooking, setViewingBooking] = useState<BookingResponseDto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState<BookingAvailabilityDto | undefined>();

  const { toasts, closeToast, success, error: toastError } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingApi.getAll();
      setBookings(response.bookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
      toastError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(data: CreateBookingDto) {
    try {
      setSubmitting(true);
      const newBooking = await bookingApi.create(data);
      setBookings([...bookings, newBooking]);
      setModalType(null);
      setEditingBooking(null);
      success("Booking created successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create booking";
      toastError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(id: string, data: UpdateBookingDto) {
    try {
      setSubmitting(true);
      const updatedBooking = await bookingApi.update(id, data);
      setBookings(bookings.map((b) => (b.id === id ? updatedBooking : b)));
      setModalType(null);
      setEditingBooking(null);
      setViewingBooking(null);
      success("Booking updated successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update booking";
      toastError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await bookingApi.delete(id);
      setBookings(bookings.filter((b) => b.id !== id));
      success("Booking deleted successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete booking";
      toastError(message);
    }
  }

  async function handleCancel(id: string) {
    try {
      const updatedBooking = await bookingApi.cancel(id);
      setBookings(bookings.map((b) => (b.id === id ? updatedBooking : b)));
      success("Booking cancelled successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel booking";
      toastError(message);
    }
  }

  async function handleConfirm(id: string) {
    try {
      const updatedBooking = await bookingApi.confirm(id);
      setBookings(bookings.map((b) => (b.id === id ? updatedBooking : b)));
      success("Booking confirmed successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to confirm booking";
      toastError(message);
    }
  }

  async function handleCheckIn(id: string) {
    try {
      const updatedBooking = await bookingApi.checkIn(id);
      setBookings(bookings.map((b) => (b.id === id ? updatedBooking : b)));
      success("Guest checked in successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to check in";
      toastError(message);
    }
  }

  async function handleCheckOut(id: string) {
    try {
      const updatedBooking = await bookingApi.checkOut(id);
      setBookings(bookings.map((b) => (b.id === id ? updatedBooking : b)));
      success("Guest checked out successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to check out";
      toastError(message);
    }
  }

  function handleAddBooking() {
    if (!user) {
      toastError("You must be logged in to create a booking");
      return;
    }
    setEditingBooking(null);
    setModalType("booking");
  }

  function handleEdit(booking: BookingResponseDto) {
    setEditingBooking(booking);
    setModalType("booking");
  }

  function handleView(booking: BookingResponseDto) {
    setViewingBooking(booking);
    setModalType("view");
  }

  function handleCloseModal() {
    setModalType(null);
    setEditingBooking(null);
    setViewingBooking(null);
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "PENDING").length,
    confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
    checkedIn: bookings.filter((b) => b.status === "CHECKED_IN").length,
    cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Bookings Management</h1>
              <p className="text-sm text-slate-500 mt-1">
                {stats.total} {stats.total === 1 ? "booking" : "bookings"} • {stats.pending} pending • {stats.confirmed} confirmed
              </p>
            </div>
            <button
              onClick={handleAddBooking}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium shadow-sm"
            >
              Create Booking
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("list")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "list"
                  ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Booking Management
              </div>
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "calendar"
                  ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendar View
              </div>
            </button>
            <button
              onClick={() => setActiveTab("status")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "status"
                  ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Status Tracking
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {activeTab === "list" && (
          <BookingManagement
            bookings={bookings}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        )}

        {activeTab === "calendar" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BookingCalendar
                availability={availability}
                onDateSelect={(date) => console.log("Selected date:", date)}
                onMonthChange={(date) => console.log("Month changed:", date)}
              />
            </div>
            <div>
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Upcoming Bookings
                </h3>
                <div className="space-y-3">
                  {bookings
                    .filter((b) => b.status !== "CANCELLED" && b.status !== "CHECKED_OUT")
                    .slice(0, 5)
                    .map((booking) => (
                      <button
                        key={booking.id}
                        onClick={() => handleView(booking)}
                        className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-slate-900">
                          {booking.property?.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(booking.checkIn).toLocaleDateString()} -{" "}
                          {new Date(booking.checkOut).toLocaleDateString()}
                        </p>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "status" && (
          <div>
            {bookings.length > 0 ? (
              <BookingStatusTracker booking={bookings[0]} />
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg p-12 shadow-sm">
                <div className="text-center">
                  <p className="text-slate-600">No bookings to track</p>
                </div>
              </div>
            )}
          </div>
        )}

        <Modal isOpen={modalType === "booking"} onClose={handleCloseModal}>
          <h2 className="text-xl font-semibold text-slate-900 mb-1">
            {editingBooking ? "Edit Booking" : "Create New Booking"}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {editingBooking ? "Update booking details below" : "Fill in the details to create a new booking"}
          </p>
          <BookingForm
            onSubmit={handleCreate}
            onCancel={handleCloseModal}
            loading={submitting}
            userId={user?.id}
          />
        </Modal>

        <Modal isOpen={modalType === "view"} onClose={handleCloseModal}>
          {viewingBooking && (
            <>
              <h2 className="text-xl font-semibold text-slate-900 mb-1">Booking Details</h2>
              <p className="text-sm text-slate-500 mb-6">View booking information and status</p>
              <BookingStatusTracker booking={viewingBooking} />
            </>
          )}
        </Modal>

        <ToastContainer toasts={toasts} onClose={closeToast} />
      </div>
    </div>
  );
}
