"use client";

import { useState } from "react";
import type { CreatePropertyDto } from "@repo/dto";

interface PropertyFormProps {
  onSubmit: (data: CreatePropertyDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function PropertyForm({ onSubmit, onCancel, loading }: PropertyFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [address, setAddress] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ownerId, setOwnerId] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!title || title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }
    if (!description || description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }
    if (!pricePerNight || Number(pricePerNight) < 0) {
      newErrors.pricePerNight = "Price must be a positive number";
    }
    if (!address || address.length < 5) {
      newErrors.address = "Address must be at least 5 characters";
    }
    if (!ownerId) {
      newErrors.ownerId = "Owner ID is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data: CreatePropertyDto = {
      title,
      description,
      pricePerNight: Number(pricePerNight),
      address,
      imageUrl: imageUrl || null,
      ownerId,
    };

    await onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price per Night *
        </label>
        <input
          type="number"
          value={pricePerNight}
          onChange={(e) => setPricePerNight(e.target.value)}
          step="0.01"
          min="0"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.pricePerNight && (
          <p className="text-red-500 text-sm mt-1">{errors.pricePerNight}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address *
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.address && (
          <p className="text-red-500 text-sm mt-1">{errors.address}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Owner ID *
        </label>
        <input
          type="text"
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
          placeholder="UUID"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.ownerId && (
          <p className="text-red-500 text-sm mt-1">{errors.ownerId}</p>
        )}
        <p className="text-gray-500 text-sm mt-1">Use a valid UUID or leave default for testing</p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Saving..." : "Save Property"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
