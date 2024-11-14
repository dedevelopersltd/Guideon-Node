import express from "express";
import {
  createExperiencePoint,
  getAllExperiencePoints,
  getExperiencePointById,
  updateExperiencePoint,
  deleteExperiencePoint,
} from "../../controllers/admins/ExperiencePoints.js";
import auth, { isAdmin, isSuperAdmin } from "../../middlewares/auth/auth.js";

const router = express.Router();

router.post("/", auth, createExperiencePoint);
router.get("/all", getAllExperiencePoints);
router.get("/:id", auth, getExperiencePointById);
router.put("/:id", auth, updateExperiencePoint);
router.delete("/:id", auth, deleteExperiencePoint);

export default router;
