import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { errorHandler } from "../error.middleware";
import { Request, Response, NextFunction } from "express";
import { PropertyNotFoundError, BookingNotFoundError, ValueError, DomainError } from "@repo/shared";

describe("errorHandler", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonSpy: ReturnType<typeof vi.fn>;
  let statusSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonSpy = vi.fn();
    statusSpy = vi.fn().mockReturnValue({ json: jsonSpy });

    mockReq = {
      method: "GET",
      url: "/api/test",
    };

    mockRes = {
      status: statusSpy,
    };

    mockNext = vi.fn();

    // Suppress console.error output during tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("PropertyNotFoundError handling", () => {
    it("should return 404 status for PropertyNotFoundError", () => {
      const error = new PropertyNotFoundError("property-123");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Property with id "property-123" not found',
      });
    });

    it("should include error message in response", () => {
      const error = new PropertyNotFoundError("prop-456");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
      });
    });

    it("should not call next() for PropertyNotFoundError", () => {
      const error = new PropertyNotFoundError("property-123");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("DomainError handling", () => {
    it("should return 400 status for DomainError", () => {
      const error = new ValueError("Invalid input");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Invalid input",
      });
    });

    it("should handle custom DomainError messages", () => {
      class CustomError extends DomainError {
        constructor(message: string) {
          super(message);
        }
      }

      const error = new CustomError("Custom validation failed");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Custom validation failed",
      });
    });

    it("should not call next() for DomainError", () => {
      const error = new ValueError("Invalid value");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("Unknown error handling", () => {
    it("should return 500 status for unknown errors", () => {
      const error = new Error("Unknown error");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Internal server error",
      });
    });

    it("should not expose unknown error messages", () => {
      const error = new Error("Database connection failed: password=12345");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Internal server error",
      });
    });

    it("should handle string errors", () => {
      const error = "Some string error";

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(500);
    });

    it("should handle object errors", () => {
      const error = { message: "Object error" };

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(500);
    });

    it("should handle null errors", () => {
      const error = null;

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(500);
    });

    it("should handle undefined errors", () => {
      const error = undefined;

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(500);
    });
  });

  describe("Other DomainErrors", () => {
    it("should handle BookingNotFoundError", () => {
      const error = new BookingNotFoundError("booking-123");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: expect.stringContaining("not found"),
      });
    });

    it("should handle ValueError", () => {
      const error = new ValueError("Invalid date range");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: "Invalid date range",
      });
    });
  });

  describe("Logging", () => {
    it("should log errors to console", () => {
      const consoleErrorSpy = vi.spyOn(console, "error");
      const error = new Error("Test error");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error:", error);
    });

    it("should log DomainError", () => {
      const consoleErrorSpy = vi.spyOn(console, "error");
      const error = new ValueError("Test error");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error:", error);
    });
  });

  describe("Response format", () => {
    it("should always include success: false", () => {
      const errors = [
        new PropertyNotFoundError("prop-123"),
        new ValueError("Invalid input"),
        new Error("Unknown error"),
      ];

      for (const error of errors) {
        statusSpy.mockClear();
        jsonSpy.mockClear();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        const call = jsonSpy.mock.calls[0];
        expect(call[0]).toHaveProperty("success", false);
      }
    });

    it("should always include error property", () => {
      const errors = [
        new PropertyNotFoundError("prop-123"),
        new ValueError("Invalid input"),
        new Error("Unknown error"),
      ];

      for (const error of errors) {
        statusSpy.mockClear();
        jsonSpy.mockClear();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        const call = jsonSpy.mock.calls[0];
        expect(call[0]).toHaveProperty("error");
      }
    });
  });

  describe("Edge cases", () => {
    it("should handle errors with very long messages", () => {
      const longMessage = "x".repeat(10000);
      const error = new Error(longMessage);

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(500);
    });

    it("should handle errors with special characters", () => {
      const error = new Error("Error with special chars: @#$%^&*()");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(500);
    });

    it("should handle errors with unicode", () => {
      const error = new Error("Ошибка с кириллицей");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(500);
    });
  });
});
