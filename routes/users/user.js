import express from "express";
import {
  signup,
  login,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  resetPassword,
  verifyResetEmail,
  resendVerificationCodeReset,
  updateUserSettings,
  getUserSettings,
  getUserInformation,
  updateProfile,
  goolelogin,
  getAllUsers,
  getUsersInChats,
  fetchAllUsers,
  fetchByUsername,
  getUserBooking,
  getAllSingleUserBooking,
  getExplorationsBookings,
} from "../../controllers/users/user.js";
import auth from "../../middlewares/auth/auth.js";
import { createPersonalInfo } from "../../controllers/users/personal.js";

const router = express.Router();

router.get("/users/chats", auth, getUsersInChats);

router.get("/users", auth, getAllUsers);

router.post("/user/signup", signup);

router.post("/user/socail-auth", goolelogin);

router.post("/create-profile", createPersonalInfo);

router.post("/user/login", login);

router.post("/verify-email", verifyEmail);

router.post("/resend-verification-code", resendVerificationCode);

router.post("/forgot-request", forgotPassword);

router.post("/emailVerify-request", verifyResetEmail);

router.post("/reset-password", resetPassword);

router.post("/resend-verification-code-reset", resendVerificationCodeReset);

router.get("/settings", auth, getUserSettings);

router.get("/get-Information", auth, getUserInformation);

router.put("/update-settings", auth, updateUserSettings);

router.put("/update-profile", auth, updateProfile);

router.get("/fetch-users", auth, fetchAllUsers);

router.get("/fetch-by-username/:id", auth, fetchByUsername);

router.get("/protected", auth, (req, res) => {
  res.json({ message: "Access Granted" });
});

router.get("/user/bookings/:id", auth, getUserBooking);

router.get("/user/all-bookings/:type", auth, getAllSingleUserBooking);

/// get all bookings

router.get("/user/explore/bookings", auth, getExplorationsBookings);

export default router;
