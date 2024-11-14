// userRoutes.js
import express from "express";
import {
  createPersonalInfo,
  getUserInfo,
  updatePersonalInfo,
} from "../../controllers/users/personal.js";
import auth from "../../middlewares/auth/auth.js";

const router = express.Router();

router.post("/create-profile", createPersonalInfo);

router.get("/user-info", auth, getUserInfo);

router.put("/user/profile-update", auth, updatePersonalInfo);

export default router;
