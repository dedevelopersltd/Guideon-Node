// userRoutes.js
import express from "express";
import { updateExperiencePoints } from "../../controllers/users/Experiencepoints.js";
import auth from "../../middlewares/auth/auth.js";

const router = express.Router();

router.put("/user/xp/points", auth, updateExperiencePoints);

export default router;
