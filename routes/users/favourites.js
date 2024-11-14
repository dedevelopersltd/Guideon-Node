import express from "express";
import Favourite from "../../models/users/favourite.js";
import auth from "../../middlewares/auth/auth.js";
import mongoose from "mongoose";
// Importing controllers

const router = express.Router();
// create add favourites
const createFavourite = async (req, res) => {
  try {
    const user = req.user;
    const { bookingType, bookingInfo } = req.body;

    const result = await Favourite.create({
      customer: user.userId,
      bookingType: bookingType,
      bookingInfo: bookingInfo,
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
};

const deleteFavourite = async (req, res) => {
  try {
    const result = await Favourite.findByIdAndDelete(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
};

const getAllFavourites = async (req, res) => {
  try {
    const user = req.user;
    const result = await Favourite.find({ customer: user.userId });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
};
const getSingleFavourite = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(500).json({ error: "Invalid Favourite Id" });
    const result = await Favourite.findById(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Routes

router.post("/", auth, createFavourite);
router.delete("/:id", auth, deleteFavourite);
router.get("/:id", auth, getSingleFavourite);
router.get("/", auth, getAllFavourites);

// Exporting the favourites Routes
export default router;
