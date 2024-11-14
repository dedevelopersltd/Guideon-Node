import mongoose from "mongoose";
const TransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserBooking",
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    required: true,
  },
  transactionType: {
    type: String,
    required: true,
  },
  trxId: {
    type: String,
    required: true,
  },
  transactionDate: {
    type: Date,
    required: true,
  },
});

const Transaction = mongoose.model("Transaction", TransactionSchema);
export default Transaction;
