"use client";

import { useEffect, useState } from "react";
import { PropertyList } from "@/entities/property";
import { PropertyForm } from "@/features/property";
import { Modal } from "@/shared/ui";
import { propertyApi } from "@/shared/api";
import type { PropertyResponseDto, CreatePropertyDto, UpdatePropertyDto } from "@repo/dto";

const DEFAULT_OWNER_ID = "00000000-0000-0000-0000-000000000001";

export default function Home() {
  const [properties, setProperties] = useState<PropertyResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyResponseDto | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(data: CreatePropertyDto | FormData) {
    try {
      setSubmitting(true);
      const newProperty = await propertyApi.create(data);
      setProperties([...properties, newProperty]);
      setIsModalOpen(false);
      setEditingProperty(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create property");
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
      setIsModalOpen(false);
      setEditingProperty(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update property");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(id: string) {
    const property = properties.find((p) => p.id === id);
    if (property) {
      setEditingProperty(property);
      setIsModalOpen(true);
    }
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingProperty(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      await propertyApi.delete(id);
      setProperties(properties.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete property");
    }
  }

  async function handleCleanupImages() {
    if (!confirm("This will delete all unused images. Continue?")) {
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/cleanup/images", {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        alert(`Cleanup completed! Deleted ${data.data.deleted} files.`);
        if (data.data.errors.length > 0) {
          console.warn("Cleanup errors:", data.data.errors);
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Cleanup failed");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Properties Management</h1>
              <p className="text-sm text-slate-500 mt-1">Manage your property portfolio</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCleanupImages}
                className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
              >
                Cleanup Images
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium shadow-sm"
              >
                Add Property
              </button>
            </div>
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
          properties={properties}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
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
    </div>
  );
}
