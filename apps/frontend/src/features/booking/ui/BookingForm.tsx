"use client";

import { useState, useEffect } from "react";
import { CreateBookingDto, PropertyResponseDto, BookingResponseDto } from "@repo/dto";
import { propertyApi } from "@/shared/api";

interface BookingFormProps {
  onSubmit: (data: CreateBookingDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialData?: BookingResponseDto;
  userId?: string;
}

export function BookingForm({
  onSubmit,
  onCancel,
  loading = false,
  initialData,
  userId,
}: BookingFormProps) {
  const [properties, setProperties] = useState<PropertyResponseDto[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyResponseDto | null>(null);
  const [calculatedPrice, setCalculatedPrice] = useState<{ totalPrice: number; nights: number } | null>(null);

  const [formData, setFormData] = useState({
    propertyId: initialData?.propertyId || "",
    checkIn: initialData?.checkIn
      ? new Date(initialData.checkIn).toISOString().split("T")[0]
      : "",
    checkOut: initialData?.checkOut
      ? new Date(initialData.checkOut).toISOString().split("T")[0]
      : "",
    guests: initialData?.guests || 1,
    specialRequests: initialData?.specialRequests || "",
  });

  useEffect(() => {
    propertyApi.getAll().then((response) => {
      setProperties(response.properties);
    });
  }, []);

  useEffect(() => {
    if (formData.propertyId) {
      const property = properties.find((p) => p.id === formData.propertyId);
      setSelectedProperty(property || null);
    }
  }, [formData.propertyId, properties]);

  useEffect(() => {
    if (selectedProperty && formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

      if (nights > 0) {
        setCalculatedPrice({
          totalPrice: nights * selectedProperty.pricePerNight,
          nights,
        });
      } else {
        setCalculatedPrice(null);
      }
    } else {
      setCalculatedPrice(null);
    }
  }, [selectedProperty, formData.checkIn, formData.checkOut]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert("User ID is required");
      return;
    }

    const data: CreateBookingDto = {
      propertyId: formData.propertyId,
      userId,
      checkIn: new Date(formData.checkIn),
      checkOut: new Date(formData.checkOut),
      guests: formData.guests,
      totalPrice: calculatedPrice?.totalPrice || 0,
      specialRequests: formData.specialRequests || undefined,
    };

    await onSubmit(data);
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="property" className="block text-sm font-medium text-slate-700 mb-2">
          Property *
        </label>
        <select
          id="property"
          required
          value={formData.propertyId}
          onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          disabled={loading}
        >
          <option value="">Select a property</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.title} - ${property.pricePerNight}/night
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="checkIn" className="block text-sm font-medium text-slate-700 mb-2">
            Check-in Date *
          </label>
          <input
            id="checkIn"
            type="date"
            required
            min={minDate}
            value={formData.checkIn}
            onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="checkOut" className="block text-sm font-medium text-slate-700 mb-2">
            Check-out Date *
          </label>
          <input
            id="checkOut"
            type="date"
            required
            min={formData.checkIn || minDate}
            value={formData.checkOut}
            onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="guests" className="block text-sm font-medium text-slate-700 mb-2">
          Number of Guests *
        </label>
        <input
          id="guests"
          type="number"
          required
          min="1"
          max="20"
          value={formData.guests}
          onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) || 1 })}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="specialRequests" className="block text-sm font-medium text-slate-700 mb-2">
          Special Requests
        </label>
        <textarea
          id="specialRequests"
          rows={3}
          value={formData.specialRequests}
          onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
          placeholder="Any special requests or notes..."
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
          disabled={loading}
        />
      </div>

      {calculatedPrice && selectedProperty && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-orange-900 mb-2">Price Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-orange-800">
              <span>Price per night:</span>
              <span>${selectedProperty.pricePerNight}</span>
            </div>
            <div className="flex justify-between text-orange-800">
              <span>Number of nights:</span>
              <span>{calculatedPrice.nights}</span>
            </div>
            <div className="flex justify-between text-orange-800 font-semibold pt-2 border-t border-orange-300">
              <span>Total:</span>
              <span>${calculatedPrice.totalPrice}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading || !calculatedPrice}
          className="flex-1 px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
        >
          {loading ? "Processing..." : initialData ? "Update Booking" : "Create Booking"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
