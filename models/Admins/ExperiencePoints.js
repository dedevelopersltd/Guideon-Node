import mongoose from "mongoose";

const { Schema, model } = mongoose;

const experiencePointsSchemaadmin = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    xp: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ExperiencePoints = model(
  "ExperiencePointsadmin",
  experiencePointsSchemaadmin
);

export default ExperiencePoints;
