import { PropertyCard } from "./PropertyCard";
import type { PropertyResponseDto } from "@repo/dto";

interface PropertyListProps {
  properties: PropertyResponseDto[];
  onViewDetails?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

export function PropertyList({
  properties,
  onViewDetails,
  onEdit,
  onDelete,
  loading,
}: PropertyListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No properties found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onViewDetails={onViewDetails}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
