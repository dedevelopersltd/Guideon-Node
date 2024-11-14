import mongoose from "mongoose";
const userBookingSchema = new mongoose.Schema(
  {
    bookingInfo: {},
    paymentAmount: {
      type: String,
    },
    paymentMethod: {
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
const UserBooking = mongoose.model("UserBooking", userBookingSchema);
export default UserBooking;
