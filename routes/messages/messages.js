import express from "express";
import {
  clearChatWithUser,
  createMessage,
  fetchAllRecentChats,
  getAllMessages,
  getUnreadMessages,
  markAllMessagesAsRead,
} from "../../controllers/users/messages.js";

import auth from "../../middlewares/auth/auth.js";

const router = express.Router();

router.get("/fetch-userchats", auth, fetchAllRecentChats);

router.post("/addmsg", auth, createMessage);
router.post("/getmsg", auth, getAllMessages);

router.get("/unread", auth, getUnreadMessages);

router.post("/markread", auth, markAllMessagesAsRead);

router.post("/clearmsg", auth, clearChatWithUser);

export default router;
