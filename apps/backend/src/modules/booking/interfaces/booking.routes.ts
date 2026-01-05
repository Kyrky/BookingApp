import { Router } from "express";
import { BookingContainer } from "../di/booking.container";
import { authMiddleware, requireAdmin } from "../../../shared/middleware/auth.middleware";
import { JwtServiceImpl } from "../../../shared/infrastructure/jwt.service.impl";

const router = Router();
const controller = BookingContainer.getController();
const jwtService = new JwtServiceImpl();

// Public routes (not applicable for bookings - all require auth)

// Protected routes (require authentication)
router.get("/my", authMiddleware(jwtService), (req, res) => controller.getBookingsByUser(req, res));

// Admin only routes
router.get("/", authMiddleware(jwtService), requireAdmin, (req, res) => controller.getBookings(req, res));
router.get("/:id", authMiddleware(jwtService), (req, res) => controller.getBookingById(req, res));
router.post("/", authMiddleware(jwtService), (req, res) => controller.createBooking(req, res));
router.put("/:id", authMiddleware(jwtService), (req, res) => controller.updateBooking(req, res));
router.delete("/:id", authMiddleware(jwtService), (req, res) => controller.deleteBooking(req, res));

// Action routes
router.post("/:id/cancel", authMiddleware(jwtService), (req, res) => controller.cancelBooking(req, res));
router.post("/:id/confirm", authMiddleware(jwtService), (req, res) => controller.confirmBooking(req, res));
router.post("/:id/check-in", authMiddleware(jwtService), (req, res) => controller.checkInBooking(req, res));
router.post("/:id/check-out", authMiddleware(jwtService), (req, res) => controller.checkOutBooking(req, res));

export default router;
