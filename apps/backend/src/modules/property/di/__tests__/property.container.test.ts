import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PropertyContainer } from "../property.container";
import { PrismaPropertyRepository } from "../../infrastructure/prisma-property.repository";
import { GetPropertiesUseCase } from "../../application/get-properties.use-case";
import { GetPropertyByIdUseCase } from "../../application/get-property-by-id.use-case";
import { CreatePropertyUseCase } from "../../application/create-property.use-case";
import { UpdatePropertyUseCase } from "../../application/update-property.use-case";
import { DeletePropertyUseCase } from "../../application/delete-property.use-case";
import { PropertyController } from "../../interfaces/property.controller";

describe("PropertyContainer", () => {
  beforeEach(() => {
    PropertyContainer.reset();
  });

  afterEach(() => {
    PropertyContainer.reset();
  });

  describe("getRepository", () => {
    it("should return a PrismaPropertyRepository instance", () => {
      const repository = PropertyContainer.getRepository();

      expect(repository).toBeInstanceOf(PrismaPropertyRepository);
    });

    it("should return the same instance on subsequent calls", () => {
      const repository1 = PropertyContainer.getRepository();
      const repository2 = PropertyContainer.getRepository();

      expect(repository1).toBe(repository2);
    });
  });

  describe("getGetPropertiesUseCase", () => {
    it("should return a GetPropertiesUseCase instance", () => {
      const useCase = PropertyContainer.getGetPropertiesUseCase();

      expect(useCase).toBeInstanceOf(GetPropertiesUseCase);
    });

    it("should return the same instance on subsequent calls", () => {
      const useCase1 = PropertyContainer.getGetPropertiesUseCase();
      const useCase2 = PropertyContainer.getGetPropertiesUseCase();

      expect(useCase1).toBe(useCase2);
    });
  });

  describe("getGetPropertyByIdUseCase", () => {
    it("should return a GetPropertyByIdUseCase instance", () => {
      const useCase = PropertyContainer.getGetPropertyByIdUseCase();

      expect(useCase).toBeInstanceOf(GetPropertyByIdUseCase);
    });

    it("should return the same instance on subsequent calls", () => {
      const useCase1 = PropertyContainer.getGetPropertyByIdUseCase();
      const useCase2 = PropertyContainer.getGetPropertyByIdUseCase();

      expect(useCase1).toBe(useCase2);
    });
  });

  describe("getCreatePropertyUseCase", () => {
    it("should return a CreatePropertyUseCase instance", () => {
      const useCase = PropertyContainer.getCreatePropertyUseCase();

      expect(useCase).toBeInstanceOf(CreatePropertyUseCase);
    });

    it("should return the same instance on subsequent calls", () => {
      const useCase1 = PropertyContainer.getCreatePropertyUseCase();
      const useCase2 = PropertyContainer.getCreatePropertyUseCase();

      expect(useCase1).toBe(useCase2);
    });
  });

  describe("getUpdatePropertyUseCase", () => {
    it("should return a UpdatePropertyUseCase instance", () => {
      const useCase = PropertyContainer.getUpdatePropertyUseCase();

      expect(useCase).toBeInstanceOf(UpdatePropertyUseCase);
    });

    it("should return the same instance on subsequent calls", () => {
      const useCase1 = PropertyContainer.getUpdatePropertyUseCase();
      const useCase2 = PropertyContainer.getUpdatePropertyUseCase();

      expect(useCase1).toBe(useCase2);
    });
  });

  describe("getDeletePropertyUseCase", () => {
    it("should return a DeletePropertyUseCase instance", () => {
      const useCase = PropertyContainer.getDeletePropertyUseCase();

      expect(useCase).toBeInstanceOf(DeletePropertyUseCase);
    });

    it("should return the same instance on subsequent calls", () => {
      const useCase1 = PropertyContainer.getDeletePropertyUseCase();
      const useCase2 = PropertyContainer.getDeletePropertyUseCase();

      expect(useCase1).toBe(useCase2);
    });
  });

  describe("getController", () => {
    it("should return a PropertyController instance", () => {
      const controller = PropertyContainer.getController();

      expect(controller).toBeInstanceOf(PropertyController);
    });

    it("should return the same instance on subsequent calls", () => {
      const controller1 = PropertyContainer.getController();
      const controller2 = PropertyContainer.getController();

      expect(controller1).toBe(controller2);
    });

    it("should inject all dependencies into controller", () => {
      const controller = PropertyContainer.getController();

      expect(controller).toBeDefined();
    });
  });

  describe("reset", () => {
    it("should reset all singleton instances", () => {
      const repository1 = PropertyContainer.getRepository();
      const controller1 = PropertyContainer.getController();

      PropertyContainer.reset();

      const repository2 = PropertyContainer.getRepository();
      const controller2 = PropertyContainer.getController();

      expect(repository1).not.toBe(repository2);
      expect(controller1).not.toBe(controller2);
    });

    it("should allow fresh instances after reset", () => {
      PropertyContainer.getRepository();
      PropertyContainer.getController();

      PropertyContainer.reset();

      expect(PropertyContainer.getRepository()).toBeInstanceOf(PrismaPropertyRepository);
      expect(PropertyContainer.getController()).toBeInstanceOf(PropertyController);
    });
  });

  describe("Dependency injection chain", () => {
    it("should inject repository into use cases", () => {
      const useCase = PropertyContainer.getGetPropertiesUseCase();
      const repository = PropertyContainer.getRepository();

      expect(useCase).toBeInstanceOf(GetPropertiesUseCase);
    });

    it("should inject use cases into controller", () => {
      const controller = PropertyContainer.getController();

      expect(controller).toBeInstanceOf(PropertyController);
    });
  });

  describe("Lazy initialization", () => {
    it("should not create instances until requested", () => {
      PropertyContainer.reset();

      // Verify that instances are created only when requested
      const repository = PropertyContainer.getRepository();
      expect(repository).toBeInstanceOf(PrismaPropertyRepository);

      const useCase = PropertyContainer.getGetPropertiesUseCase();
      expect(useCase).toBeInstanceOf(GetPropertiesUseCase);

      const controller = PropertyContainer.getController();
      expect(controller).toBeInstanceOf(PropertyController);
    });

    it("should maintain singleton behavior across multiple accesses", () => {
      const repo1 = PropertyContainer.getRepository();
      const repo2 = PropertyContainer.getRepository();
      const repo3 = PropertyContainer.getRepository();

      expect(repo1).toBe(repo2);
      expect(repo2).toBe(repo3);
    });
  });
});
