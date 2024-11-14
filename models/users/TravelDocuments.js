import mongoose from "mongoose";

const travelInformationSchema = new mongoose.Schema({
  passportNumber: {
    type: String,
    required: true,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  nationality: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

const TravelInformation = mongoose.model(
  "TravelInformation",
  travelInformationSchema
);

export default TravelInformation;
