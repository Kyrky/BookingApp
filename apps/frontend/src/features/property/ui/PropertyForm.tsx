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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors text-sm"
          placeholder="Enter property title"
        />
        {errors.title && (
          <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors text-sm resize-none"
          placeholder="Describe the property..."
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.description}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Price per Night <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
          <input
            type="number"
            value={pricePerNight}
            onChange={(e) => setPricePerNight(e.target.value)}
            step="0.01"
            min="0"
            className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors text-sm"
            placeholder="0.00"
          />
        </div>
        {errors.pricePerNight && (
          <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.pricePerNight}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors text-sm"
          placeholder="Enter full address"
        />
        {errors.address && (
          <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.address}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Property Image
        </label>
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-slate-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-3 max-h-40 rounded-lg border border-slate-200"
            />
          )}
        </div>
        {!imageFile && (
          <div className="mt-3">
            <div className="relative">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors text-sm pr-10"
              />
              <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <p className="text-slate-500 text-xs mt-1.5">Or enter an external image URL</p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Owner ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
          placeholder="UUID"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors text-sm font-mono"
        />
        {errors.ownerId && (
          <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.ownerId}
          </p>
        )}
        <p className="text-slate-500 text-xs mt-1.5">Use a valid UUID or leave default for testing</p>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
        >
          {loading ? "Saving..." : "Save Property"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
