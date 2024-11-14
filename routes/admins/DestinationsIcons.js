import express from "express";
import {
  getAllIcons,
  getIconById,
  createIcon,
  updateIcon,
  deleteIcon,
} from "../../controllers/admins/DestinationsIcons.js";

const router = express.Router();

router.get("/icons", getAllIcons);

router.get("/icons/:id", getIconById);

router.post("/icons", createIcon);

router.put("/icons/:id", updateIcon);

router.delete("/icons/:id", deleteIcon);

export default router;
