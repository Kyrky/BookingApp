import { z } from "zod";

export const createPropertySchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  pricePerNight: z.number().min(0).max(1000000),
  address: z.string().min(5).max(500),
  imageUrl: z.string().url().nullable().optional(),
  ownerId: z.string().uuid(),
});

export const updatePropertySchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  pricePerNight: z.number().min(0).max(1000000).optional(),
  address: z.string().min(5).max(500).optional(),
  imageUrl: z.string().url().nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update",
});

export const propertyIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
