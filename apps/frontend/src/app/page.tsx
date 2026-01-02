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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Property
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
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
        <h2 className="text-2xl font-bold mb-4">
          {editingProperty ? "Edit Property" : "Add New Property"}
        </h2>
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
