import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PropertyController } from "../property.controller";
import { GetPropertiesUseCase } from "../../application/get-properties.use-case";
import { GetPropertyByIdUseCase } from "../../application/get-property-by-id.use-case";
import { CreatePropertyUseCase } from "../../application/create-property.use-case";
import { UpdatePropertyUseCase } from "../../application/update-property.use-case";
import { DeletePropertyUseCase } from "../../application/delete-property.use-case";
import { Property, PropertyStatus } from "@repo/shared";
import { Address, Price } from "@repo/shared";
import { AuthenticatedRequest } from "../../../../shared/utils/logger.util";
import { Response } from "express";

// Mock logger
vi.mock("@repo/shared", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@repo/shared")>();
  const createMockLogger = () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    child: vi.fn(() => createMockLogger()),
  });
  return {
    ...actual,
    logger: createMockLogger(),
  };
});

// Mock logger utility
vi.mock("../../../../shared/utils/logger.util", () => ({
  loggerWithUser: vi.fn(() => {
    const createMockLogger = () => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      child: vi.fn(() => createMockLogger()),
    });
    return createMockLogger();
  }),
}));

// Mock file utilities
vi.mock("../../../../utils/file.utils", () => ({
  deleteImageFile: vi.fn(),
}));

describe("PropertyController", () => {
  let controller: PropertyController;
  let mockGetPropertiesUseCase: GetPropertiesUseCase;
  let mockGetPropertyByIdUseCase: GetPropertyByIdUseCase;
  let mockCreatePropertyUseCase: CreatePropertyUseCase;
  let mockUpdatePropertyUseCase: UpdatePropertyUseCase;
  let mockDeletePropertyUseCase: DeletePropertyUseCase;
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let jsonSpy: ReturnType<typeof vi.fn>;
  let statusSpy: ReturnType<typeof vi.fn>;

  const mockAddress = Address.create("123 Main Street, City, Country");
  const mockPrice = Price.create(100);
  const mockProperty: Property = Property.create({
    id: "property-123",
    title: "Test Property",
    description: "A beautiful test property for testing purposes",
    address: mockAddress,
    pricePerNight: mockPrice,
    imageUrl: "https://example.com/image.jpg",
    ownerId: "user-123",
    status: PropertyStatus.AVAILABLE,
    createdAt: new Date("2025-01-01"),
  });

  beforeEach(() => {
    mockGetPropertiesUseCase = {
      execute: vi.fn(),
    } as unknown as GetPropertiesUseCase;

    mockGetPropertyByIdUseCase = {
      execute: vi.fn(),
    } as unknown as GetPropertyByIdUseCase;

    mockCreatePropertyUseCase = {
      execute: vi.fn(),
    } as unknown as CreatePropertyUseCase;

    mockUpdatePropertyUseCase = {
      execute: vi.fn(),
    } as unknown as UpdatePropertyUseCase;

    mockDeletePropertyUseCase = {
      execute: vi.fn(),
    } as unknown as DeletePropertyUseCase;

    controller = new PropertyController(
      mockGetPropertiesUseCase,
      mockGetPropertyByIdUseCase,
      mockCreatePropertyUseCase,
      mockUpdatePropertyUseCase,
      mockDeletePropertyUseCase
    );

    jsonSpy = vi.fn();
    statusSpy = vi.fn().mockReturnValue({ json: jsonSpy });

    mockReq = {
      params: {},
      body: {},
      file: undefined,
    };

    mockRes = {
      status: statusSpy,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getProperties", () => {
    it("should return all properties successfully", async () => {
      vi.mocked(mockGetPropertiesUseCase.execute).mockResolvedValue([mockProperty]);

      await controller.getProperties(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: {
          properties: expect.arrayContaining([
            expect.objectContaining({
              id: "property-123",
              title: "Test Property",
            }),
          ]),
          total: 1,
        },
      });
    });

    it("should return empty list when no properties exist", async () => {
      vi.mocked(mockGetPropertiesUseCase.execute).mockResolvedValue([]);

      await controller.getProperties(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: {
          properties: [],
          total: 0,
        },
      });
    });

    it("should handle errors when getting properties", async () => {
      vi.mocked(mockGetPropertiesUseCase.execute).mockRejectedValue(
        new Error("Database error")
      );

      await controller.getProperties(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Failed to get properties",
      });
    });

    it("should handle non-Error errors", async () => {
      vi.mocked(mockGetPropertiesUseCase.execute).mockRejectedValue("String error");

      await controller.getProperties(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Failed to get properties",
      });
    });
  });

  describe("getPropertyById", () => {
    it("should return property by id successfully", async () => {
      mockReq.params = { id: "property-123" };
      vi.mocked(mockGetPropertyByIdUseCase.execute).mockResolvedValue(mockProperty);

      await controller.getPropertyById(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockGetPropertyByIdUseCase.execute).toHaveBeenCalledWith("property-123");
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: "property-123",
          title: "Test Property",
        }),
      });
    });

    it("should return 400 when id is missing", async () => {
      mockReq.params = {};

      await controller.getPropertyById(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockGetPropertyByIdUseCase.execute).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Property ID is required",
      });
    });

    it("should return 404 when property not found", async () => {
      mockReq.params = { id: "non-existent" };
      vi.mocked(mockGetPropertyByIdUseCase.execute).mockRejectedValue(
        new Error("Property not found")
      );

      await controller.getPropertyById(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Property not found",
      });
    });

    it("should handle non-Error errors", async () => {
      mockReq.params = { id: "property-123" };
      vi.mocked(mockGetPropertyByIdUseCase.execute).mockRejectedValue("String error");

      await controller.getPropertyById(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Property not found",
      });
    });
  });

  describe("createProperty", () => {
    it("should create property successfully", async () => {
      mockReq = {
        ...mockReq,
        userId: "user-123",
        body: {
          title: "New Property",
          description: "A beautiful new property",
          pricePerNight: 150,
          address: "456 Oak Avenue",
        },
        file: undefined,
      };
      vi.mocked(mockCreatePropertyUseCase.execute).mockResolvedValue(mockProperty);

      await controller.createProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockCreatePropertyUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Property",
          description: "A beautiful new property",
          pricePerNight: 150,
          address: "456 Oak Avenue",
          ownerId: "user-123",
          imageUrl: null,
        })
      );
      expect(statusSpy).toHaveBeenCalledWith(201);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: "property-123",
        }),
      });
    });

    it("should create property with image file", async () => {
      const mockFile = {
        filename: "test-image.jpg",
      } as Express.Multer.File;

      mockReq = {
        ...mockReq,
        userId: "user-123",
        body: {
          title: "New Property",
          description: "A beautiful new property",
          pricePerNight: 150,
          address: "456 Oak Avenue",
        },
        file: mockFile,
      };
      vi.mocked(mockCreatePropertyUseCase.execute).mockResolvedValue(mockProperty);

      await controller.createProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockCreatePropertyUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          imageUrl: "/uploads/test-image.jpg",
        })
      );
    });

    it("should return 401 when userId is missing", async () => {
      mockReq = {
        ...mockReq,
        userId: undefined,
        body: {
          title: "New Property",
          description: "A beautiful new property",
          pricePerNight: 150,
          address: "456 Oak Avenue",
        },
      };

      await controller.createProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockCreatePropertyUseCase.execute).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Unauthorized",
      });
    });

    it("should handle errors when creating property", async () => {
      mockReq = {
        ...mockReq,
        userId: "user-123",
        body: {
          title: "New Property",
          description: "A beautiful new property",
          pricePerNight: 150,
          address: "456 Oak Avenue",
        },
      };
      vi.mocked(mockCreatePropertyUseCase.execute).mockRejectedValue(
        new Error("Database error")
      );

      await controller.createProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Failed to create property",
      });
    });

    it("should handle non-Error errors", async () => {
      mockReq = {
        ...mockReq,
        userId: "user-123",
        body: {
          title: "New Property",
          description: "A beautiful new property",
          pricePerNight: 150,
          address: "456 Oak Avenue",
        },
      };
      vi.mocked(mockCreatePropertyUseCase.execute).mockRejectedValue("String error");

      await controller.createProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Failed to create property",
      });
    });
  });

  describe("updateProperty", () => {
    it("should update property successfully", async () => {
      mockReq.params = { id: "property-123" };
      mockReq.body = {
        title: "Updated Property",
        description: "Updated description",
        pricePerNight: 200,
        address: "789 Pine Road",
      };
      vi.mocked(mockGetPropertyByIdUseCase.execute).mockResolvedValue(mockProperty);
      vi.mocked(mockUpdatePropertyUseCase.execute).mockResolvedValue(mockProperty);

      await controller.updateProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockUpdatePropertyUseCase.execute).toHaveBeenCalledWith("property-123", {
        title: "Updated Property",
        description: "Updated description",
        pricePerNight: 200,
        address: "789 Pine Road",
      });
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: "property-123",
        }),
      });
    });

    it("should update property with new image file", async () => {
      const mockFile = {
        filename: "new-image.jpg",
      } as Express.Multer.File;

      mockReq.params = { id: "property-123" };
      mockReq.body = {
        title: "Updated Property",
      };
      mockReq.file = mockFile;

      vi.mocked(mockGetPropertyByIdUseCase.execute).mockResolvedValue(mockProperty);
      vi.mocked(mockUpdatePropertyUseCase.execute).mockResolvedValue(mockProperty);

      await controller.updateProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockUpdatePropertyUseCase.execute).toHaveBeenCalledWith("property-123", {
        title: "Updated Property",
        imageUrl: "/uploads/new-image.jpg",
      });
    });

    it("should return 400 when id is missing", async () => {
      mockReq.params = {};
      mockReq.body = { title: "Updated Property" };

      await controller.updateProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockUpdatePropertyUseCase.execute).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Property ID is required",
      });
    });

    it("should handle errors when updating property", async () => {
      mockReq.params = { id: "property-123" };
      mockReq.body = { title: "Updated Property" };
      vi.mocked(mockGetPropertyByIdUseCase.execute).mockResolvedValue(mockProperty);
      vi.mocked(mockUpdatePropertyUseCase.execute).mockRejectedValue(
        new Error("Database error")
      );

      await controller.updateProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Failed to update property",
      });
    });

    it("should handle non-Error errors", async () => {
      mockReq.params = { id: "property-123" };
      mockReq.body = { title: "Updated Property" };
      vi.mocked(mockGetPropertyByIdUseCase.execute).mockResolvedValue(mockProperty);
      vi.mocked(mockUpdatePropertyUseCase.execute).mockRejectedValue("String error");

      await controller.updateProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Failed to update property",
      });
    });

    it("should convert pricePerNight to number", async () => {
      mockReq.params = { id: "property-123" };
      mockReq.body = { pricePerNight: "250" };
      vi.mocked(mockGetPropertyByIdUseCase.execute).mockResolvedValue(mockProperty);
      vi.mocked(mockUpdatePropertyUseCase.execute).mockResolvedValue(mockProperty);

      await controller.updateProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockUpdatePropertyUseCase.execute).toHaveBeenCalledWith("property-123", {
        pricePerNight: 250,
      });
    });

    it("should handle undefined pricePerNight", async () => {
      mockReq.params = { id: "property-123" };
      mockReq.body = { title: "Updated Property", pricePerNight: undefined };
      vi.mocked(mockGetPropertyByIdUseCase.execute).mockResolvedValue(mockProperty);
      vi.mocked(mockUpdatePropertyUseCase.execute).mockResolvedValue(mockProperty);

      await controller.updateProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockUpdatePropertyUseCase.execute).toHaveBeenCalledWith("property-123", {
        title: "Updated Property",
      });
    });
  });

  describe("deleteProperty", () => {
    it("should delete property successfully", async () => {
      mockReq.params = { id: "property-123" };
      vi.mocked(mockGetPropertyByIdUseCase.execute).mockResolvedValue(mockProperty);
      vi.mocked(mockDeletePropertyUseCase.execute).mockResolvedValue(undefined);

      await controller.deleteProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockDeletePropertyUseCase.execute).toHaveBeenCalledWith("property-123");
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: { message: "Property deleted successfully" },
      });
    });

    it("should return 400 when id is missing", async () => {
      mockReq.params = {};

      await controller.deleteProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockDeletePropertyUseCase.execute).not.toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Property ID is required",
      });
    });

    it("should handle errors when deleting property", async () => {
      mockReq.params = { id: "property-123" };
      vi.mocked(mockGetPropertyByIdUseCase.execute).mockResolvedValue(mockProperty);
      vi.mocked(mockDeletePropertyUseCase.execute).mockRejectedValue(
        new Error("Database error")
      );

      await controller.deleteProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Failed to delete property",
      });
    });

    it("should handle non-Error errors", async () => {
      mockReq.params = { id: "property-123" };
      vi.mocked(mockGetPropertyByIdUseCase.execute).mockResolvedValue(mockProperty);
      vi.mocked(mockDeletePropertyUseCase.execute).mockRejectedValue("String error");

      await controller.deleteProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Failed to delete property",
      });
    });
  });

  describe("Response format consistency", () => {
    it("should always include success: true in successful getProperties", async () => {
      vi.mocked(mockGetPropertiesUseCase.execute).mockResolvedValue([]);

      await controller.getProperties(mockReq as AuthenticatedRequest, mockRes as Response);

      const call = jsonSpy.mock.calls[0];
      expect(call[0]).toHaveProperty("success", true);
      expect(call[0]).toHaveProperty("data");
    });

    it("should always include success: true in successful getPropertyById", async () => {
      mockReq.params = { id: "property-123" };
      vi.mocked(mockGetPropertyByIdUseCase.execute).mockResolvedValue(mockProperty);

      await controller.getPropertyById(mockReq as AuthenticatedRequest, mockRes as Response);

      const call = jsonSpy.mock.calls[0];
      expect(call[0]).toHaveProperty("success", true);
      expect(call[0]).toHaveProperty("data");
    });

    it("should always include success: true in successful createProperty", async () => {
      mockReq = {
        ...mockReq,
        userId: "user-123",
        body: {
          title: "New Property",
          description: "A beautiful new property",
          pricePerNight: 150,
          address: "456 Oak Avenue",
        },
      };
      vi.mocked(mockCreatePropertyUseCase.execute).mockResolvedValue(mockProperty);

      await controller.createProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      const call = jsonSpy.mock.calls[0];
      expect(call[0]).toHaveProperty("success", true);
      expect(call[0]).toHaveProperty("data");
    });

    it("should always include success: false in failed createProperty", async () => {
      mockReq = {
        ...mockReq,
        userId: "user-123",
        body: {
          title: "New Property",
          description: "A beautiful new property",
          pricePerNight: 150,
          address: "456 Oak Avenue",
        },
      };
      vi.mocked(mockCreatePropertyUseCase.execute).mockRejectedValue(new Error("Error"));

      await controller.createProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      const call = jsonSpy.mock.calls[0];
      expect(call[0]).toHaveProperty("success", false);
      expect(call[0]).toHaveProperty("error");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty request body in updateProperty", async () => {
      mockReq.params = { id: "property-123" };
      mockReq.body = {};
      vi.mocked(mockGetPropertyByIdUseCase.execute).mockResolvedValue(mockProperty);
      vi.mocked(mockUpdatePropertyUseCase.execute).mockResolvedValue(mockProperty);

      await controller.updateProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockUpdatePropertyUseCase.execute).toHaveBeenCalledWith("property-123", {});
    });

    it("should handle numeric pricePerNight string in createProperty", async () => {
      mockReq = {
        ...mockReq,
        userId: "user-123",
        body: {
          title: "New Property",
          description: "A beautiful new property",
          pricePerNight: "999",
          address: "456 Oak Avenue",
        },
      };
      vi.mocked(mockCreatePropertyUseCase.execute).mockResolvedValue(mockProperty);

      await controller.createProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockCreatePropertyUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          pricePerNight: 999,
        })
      );
    });

    it("should handle property with null imageUrl", async () => {
      mockReq.params = { id: "property-123" };
      mockReq.body = { title: "Updated Property", imageUrl: null };
      vi.mocked(mockGetPropertyByIdUseCase.execute).mockResolvedValue(mockProperty);
      vi.mocked(mockUpdatePropertyUseCase.execute).mockResolvedValue(mockProperty);

      await controller.updateProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockUpdatePropertyUseCase.execute).toHaveBeenCalledWith("property-123", {
        title: "Updated Property",
        imageUrl: null,
      });
    });

    it("should handle property with empty string imageUrl", async () => {
      mockReq.params = { id: "property-123" };
      mockReq.body = { title: "Updated Property", imageUrl: "" };
      vi.mocked(mockGetPropertyByIdUseCase.execute).mockResolvedValue(mockProperty);
      vi.mocked(mockUpdatePropertyUseCase.execute).mockResolvedValue(mockProperty);

      await controller.updateProperty(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockUpdatePropertyUseCase.execute).toHaveBeenCalledWith("property-123", {
        title: "Updated Property",
        imageUrl: "",
      });
    });
  });
});
