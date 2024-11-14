import Amadeus from "amadeus";
import dotenv from "dotenv";
import express from "express";
const router = express.Router();

const amadeus = new Amadeus({
  clientId: process.env.AMAEDUS_KEY,
  clientSecret: process.env.AMAEDUS_SECRET,
  hostname: "test",
});

const getAllFlights = async () => {
const response = await amadeus.shopping.flightOffersSearch.get({
    originLocationCode: "LHE",
    destinationLocationCode: "JED",
    departureDate: "2024-07-22",
    adults: "1",
    max: 1,
  });
  return response.data[0];
};

export default router;
