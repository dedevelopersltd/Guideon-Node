import mongoose from "mongoose";
const favouriteSchema = new mongoose.Schema(
  {
    bookingInfo: {},
    paymentAmount: {
      type: String,
    },
    bookingType: {
      type: String,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);
const Favourite = mongoose.model("Favourite", favouriteSchema);
export default Favourite;
