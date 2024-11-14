import mongoose from "mongoose";

const personalInfoSchema = new mongoose.Schema({
  countryOfResidence: {
    type: String,
    required: true,
  },
  cityOfResidence: String,
  bio: String,
  spokenLanguages: [String],
  identificationDocuments: [String],
  coverPicture: String,
  dob: String,
  gender: String,
});

// Create the model
const PersonalInfo = mongoose.model("PersonalInfo", personalInfoSchema);

export default PersonalInfo;
