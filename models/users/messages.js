import mongoose from "mongoose";

const { Schema, model } = mongoose;

const MessagesSchema = new Schema(
  {
    message: {
      text: {
        type: String,
        required: false,
      },
      files: {
        type: [String],
      },
      read: {
        type: Boolean,
        default: false,
      },
    },
    users: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Messages = model("Messages", MessagesSchema);

export default Messages;
