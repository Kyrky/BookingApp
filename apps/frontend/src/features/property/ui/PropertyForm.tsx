"use client";

import { useState, useEffect } from "react";
import type { CreatePropertyDto, PropertyResponseDto } from "@repo/dto";

interface PropertyFormProps {
  onSubmit: (data: CreatePropertyDto | FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialData?: PropertyResponseDto | null;
}

export function PropertyForm({ onSubmit, onCancel, loading, initialData }: PropertyFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [address, setAddress] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ownerId, setOwnerId] = useState("550e8400-e29b-41d4-a716-446655440001");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setPricePerNight(String(initialData.pricePerNight));
      setAddress(initialData.address);
      setOwnerId(initialData.ownerId);
      if (initialData.imageUrl) {
        setImageUrl(initialData.imageUrl);
        setImagePreview(initialData.imageUrl);
      }
    }
  }, [initialData]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

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

    if (imageFile) {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("pricePerNight", pricePerNight);
      formData.append("address", address);
      formData.append("image", imageFile);
      formData.append("ownerId", ownerId);

      await onSubmit(formData);
    } else {
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
          Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="mt-2 max-h-40 rounded-lg"
          />
        )}
        {!imageFile && (
          <>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
            />
            <p className="text-gray-500 text-sm mt-1">Or enter image URL</p>
          </>
        )}
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
