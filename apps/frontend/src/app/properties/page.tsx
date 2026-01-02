"use client";

import { useEffect, useState, useMemo } from "react";
import { PropertyList } from "@/entities/property";
import { PropertyForm } from "@/features/property";
import { Modal, Settings, ToastContainer } from "@/shared/ui";
import { useToast } from "@/shared/ui/hooks/useToast";
import { propertyApi } from "@/shared/api";
import type { PropertyResponseDto, CreatePropertyDto, UpdatePropertyDto } from "@repo/dto";

const DEFAULT_OWNER_ID = "00000000-0000-0000-0000-000000000001";

type ModalType = "property" | "settings" | null;
type SortOption = "title" | "price-asc" | "price-desc" | "date";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingProperty, setEditingProperty] = useState<PropertyResponseDto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [priceFilter, setPriceFilter] = useState<{ min: string; max: string }>({ min: "", max: "" });

  const { toasts, showToast, closeToast, success, error: toastError } = useToast();

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    try {
      setLoading(true);
      setError(null);
      const response = await propertyApi.getAll();
      setProperties(response.properties);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load properties");
      toastError(err instanceof Error ? err.message : "Failed to load properties");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(data: CreatePropertyDto | FormData) {
    try {
      setSubmitting(true);
      const newProperty = await propertyApi.create(data);
      setProperties([...properties, newProperty]);
      setModalType(null);
      setEditingProperty(null);
      success("Property created successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create property";
      toastError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(data: CreatePropertyDto | FormData) {
    if (!editingProperty) return;

    try {
      setSubmitting(true);
      const updatedProperty = await propertyApi.update(editingProperty.id, data);
      setProperties(properties.map((p) => p.id === editingProperty.id ? updatedProperty : p));
      setModalType(null);
      setEditingProperty(null);
      success("Property updated successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update property";
      toastError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(id: string) {
    const property = properties.find((p) => p.id === id);
    if (property) {
      setEditingProperty(property);
      setModalType("property");
    }
  }

  function handleAddProperty() {
    setEditingProperty(null);
    setModalType("property");
  }

  function handleOpenSettings() {
    setModalType("settings");
  }

  function handleCloseModal() {
    setModalType(null);
    setEditingProperty(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      await propertyApi.delete(id);
      setProperties(properties.filter((p) => p.id !== id));
      success("Property deleted successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete property";
      toastError(message);
    }
  }

  // Filter and sort properties
  const filteredAndSortedProperties = useMemo(() => {
    let filtered = [...properties];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query)
      );
    }

    // Price filter
    if (priceFilter.min) {
      filtered = filtered.filter((p) => p.pricePerNight >= Number(priceFilter.min));
    }
    if (priceFilter.max) {
      filtered = filtered.filter((p) => p.pricePerNight <= Number(priceFilter.max));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "price-asc":
          return a.pricePerNight - b.pricePerNight;
        case "price-desc":
          return b.pricePerNight - a.pricePerNight;
        case "date":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [properties, searchQuery, sortBy, priceFilter]);

  const propertyCount = filteredAndSortedProperties.length;
  const avgPrice = propertyCount > 0
    ? Math.round(filteredAndSortedProperties.reduce((sum, p) => sum + p.pricePerNight, 0) / propertyCount)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Properties Management</h1>
              <p className="text-sm text-slate-500 mt-1">
                {propertyCount} {propertyCount === 1 ? "property" : "properties"} • Avg ${avgPrice}/night
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleOpenSettings}
                className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
              <button
                onClick={handleAddProperty}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium shadow-sm"
              >
                Add Property
              </button>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors text-sm"
                />
              </div>
            </div>

            {/* Price Filter */}
            <div className="flex gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={priceFilter.min}
                  onChange={(e) => setPriceFilter({ ...priceFilter, min: e.target.value })}
                  className="w-24 pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors text-sm"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceFilter.max}
                  onChange={(e) => setPriceFilter({ ...priceFilter, max: e.target.value })}
                  className="w-24 pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors text-sm"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors text-sm bg-white"
              >
                <option value="date">Newest First</option>
                <option value="title">Name (A-Z)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchQuery || priceFilter.min || priceFilter.max) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setPriceFilter({ min: "", max: "" });
                  setSortBy("date");
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium"
              >
                Clear filters
              </button>
            )}
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

        <PropertyList
          properties={filteredAndSortedProperties}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Modal isOpen={modalType === "property"} onClose={handleCloseModal}>
        <h2 className="text-xl font-semibold text-slate-900 mb-1">
          {editingProperty ? "Edit Property" : "Add New Property"}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {editingProperty ? "Update property information below" : "Fill in the details to add a new property"}
        </p>
        <PropertyForm
          onSubmit={editingProperty ? handleUpdate : handleCreate}
          onCancel={handleCloseModal}
          loading={submitting}
          initialData={editingProperty}
        />
      </Modal>

      <Modal isOpen={modalType === "settings"} onClose={handleCloseModal}>
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Settings</h2>
        <p className="text-sm text-slate-500 mb-6">Manage application settings and maintenance</p>
        <Settings onClose={handleCloseModal} />
      </Modal>

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}
