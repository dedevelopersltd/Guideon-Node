import express from "express";
import {
  deleteAdmin,
  getAdminById,
  getAllAdmins,
  loginAdmin,
  signupAdmin,
  updateAdmin,
} from "../../controllers/admins/AdminController.js";
import auth, { isSuperAdmin } from "../../middlewares/auth/auth.js";

const router = express.Router();

// Signup route
router.post("/signup", signupAdmin);

// Login route

router.post("/login", loginAdmin);

// Get All Admins

router.get("/all", auth, isSuperAdmin, getAllAdmins);

// Get Single Admin

router.get("/:id", auth, getAdminById);

// Update Admin

router.put("/:id", auth, updateAdmin);

// Delete admin
router.delete("/:id", auth, isSuperAdmin, deleteAdmin);

export default router;
