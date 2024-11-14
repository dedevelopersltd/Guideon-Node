import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    cardHolderName: {
      type: String,
      required: true,
    },
    cardNumber: {
      type: String,
      required: true,
    },
    cardType:{
      type: String,
      required: true,
    },
    expiryYear: {
      type: String,
      required: true,
    },
    expiryMonth: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Card = mongoose.model("Card", cardSchema);

export default Card;
