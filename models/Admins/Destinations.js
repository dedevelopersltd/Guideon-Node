import mongoose from "mongoose";

const { Schema, model } = mongoose;

const destinationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    icon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DestinationIcon",
    },
    currencies: {
      type: [String],
      required: true,
    },
    languages: {
      type: [String],
      required: true,
    },
    budget: {
      type: String,
      required: true,
    },
    cultureheading1: {
      type: String,
      required: true,
    },
    cultureDesp1: {
      type: String,
      required: true,
    },
    cultureheading2: {
      type: String,
      required: true,
    },
    cultureDesp2: {
      type: String,
      required: true,
    },
    cultureheading3: {
      type: String,
      required: true,
    },
    cultureDesp3: {
      type: String,
      required: true,
    },
    cultureimage: {
      type: String,
      required: true,
    },
    historyHeading1: {
      type: String,
      required: true,
    },
    historyDesp1: {
      type: String,
      required: true,
    },
    historyHeading2: {
      type: String,
      required: true,
    },
    historyDesp2: {
      type: String,
      required: true,
    },
    historyHeading3: {
      type: String,
      required: true,
    },
    historyDesp3: {
      type: String,
      required: true,
    },
    historyimage: {
      type: String,
      // required: true,
    },
    practicalHeading1: {
      type: String,
      required: true,
    },
    practicalDesp1: {
      type: String,
      required: true,
    },
    practicalHeading2: {
      type: String,
      required: true,
    },
    practicalDesp2: {
      type: String,
      required: true,
    },
    practicalHeading3: {
      type: String,
      required: true,
    },
    practicalDesp3: {
      type: String,
      required: true,
    },
    instagramLink: {
      type: String,
    },
    telegramLink: {
      type: String,
    },
    tiktokLink: {
      type: String,
    },
    spotifyLink: {
      type: String,
    },
    snapchatLink: {
      type: String,
    },
    facebookMessengerLink: {
      type: String,
    },
    latitude: {
      type: String,
      required: true,
    },
    longitude: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    video: {
      type: String,
    },
    priceRating:{
      type:String,
      required:true
    },
    destinationRating:{
      type:String,
      required:true
    },
    foodRating:{
      type:String,
      required:true
    },
    securityRating:{
      type:String,
      required:true
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Destination = model("Destination", destinationSchema);

export default Destination;
