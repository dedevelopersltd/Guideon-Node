import mongoose from "mongoose";

const experiencePointSchema = new mongoose.Schema({
  xp: {
    type: String,
    default: "0",
  },
});

const ExperiencePoint = mongoose.model(
  "ExperiencePoint",
  experiencePointSchema
);

export default ExperiencePoint;
