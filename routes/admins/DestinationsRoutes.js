import { Router } from "express";
import {
  createDestination,
  getDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
  searchDestination,
} from "../../controllers/admins/Destinations.js";
import auth from "../../middlewares/auth/auth.js";

const router = Router();

// Create a new destination
router.post("/add-destination", auth, createDestination);

// Get all destinations
router.get("/destinations", getDestinations);

// Get a single destination by ID
router.get("/destination/:id", getDestinationById);

// Update a destination by ID
router.put("/destination/:id", auth, updateDestination);

// Delete a destination by ID
router.delete("/destination/:id", auth, deleteDestination);
router.get("/destination/search/:search", searchDestination);

export default router;
