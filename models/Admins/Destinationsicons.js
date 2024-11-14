import mongoose from "mongoose";

const DestinationIconSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const DestinationIcon = mongoose.model(
  "DestinationIcon",
  DestinationIconSchema
);

export default DestinationIcon;
