import express from "express";
import {
  addCard,
  getAllCards,
  updateCard,
  deleteCard,
} from "../../controllers/users/cards.js";
import auth from "../../middlewares/auth/auth.js";

const router = express.Router();

router.post("/cards", auth, addCard);
router.get("/cards", auth, getAllCards);
router.put("/cards/:cardId", auth, updateCard);
router.delete("/cards/:cardId", auth, deleteCard);

export default router;
