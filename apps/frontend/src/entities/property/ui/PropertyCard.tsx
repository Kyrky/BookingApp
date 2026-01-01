import type { PropertyResponseDto } from "@repo/dto";

interface PropertyCardProps {
  property: PropertyResponseDto;
  onViewDetails?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function PropertyCard({ property, onViewDetails, onEdit, onDelete }: PropertyCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {property.imageUrl && (
        <img
          src={property.imageUrl}
          alt={property.title}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
      )}
      <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
      <p className="text-gray-600 mb-2 line-clamp-2">{property.description}</p>
      <p className="text-sm text-gray-500 mb-2">{property.address}</p>
      <p className="text-lg font-bold text-green-600">
        ${property.pricePerNight}/night
      </p>
      <div className="flex gap-2 mt-4">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(property.id)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            View
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(property.id)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(property.id)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
