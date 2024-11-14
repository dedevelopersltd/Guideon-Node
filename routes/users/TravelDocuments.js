// routes/travelInformationRoutes.js
import express from "express";
import {
  addTravelInformation,
  getAllTravelInformation,
  updateTravelInformation,
} from "../../controllers/users/TravelDocuments.js";
import auth from "../../middlewares/auth/auth.js";

const router = express.Router();

router.post("/travel-document", auth, addTravelInformation);

router.get("/travel-document", auth, getAllTravelInformation);

router.put("/travel-document", auth, updateTravelInformation);

export default router;
