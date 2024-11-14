import express from "express";
import axios from "axios";
import qs from "qs";
import Amaedus from "amadeus";
import auth from "../../middlewares/auth/auth.js";
import User from "../../models/users/user.js";
import Vouchers from "../../models/Admins/Vouchers.js"
import TravelInformation from "../../models/users/TravelDocuments.js";
import mongoose from "mongoose";
import UserBooking from "../../models/users/userBookings.js";
import Transaction from "../../models/users/transactions.js";
import Card from "../../models/users/cards.js";
import { createStripeToken, stripe } from "../../util/stripe.js";
import { decrypt } from "../../middlewares/auth/Encryptions.js";
import Voucher from "../../models/Admins/Vouchers.js";
///////////////////

function simplifyFlightOrder(flightOrder) {
  const simplified = {
    orderId: flightOrder.id,
    queuingOfficeId: flightOrder.queuingOfficeId,
    bookingDate: flightOrder.associatedRecords[0].creationDate,
    flightOffers: flightOrder.flightOffers.map((offer) => {
      const lastSegmentIndex = offer.itineraries[0].segments.length - 1;
      const departureSegment = offer.itineraries[0].segments[0];
      const arrivalSegment = offer.itineraries[0].segments[lastSegmentIndex];

      return {
        flightOfferId: offer.id,
        lastTicketingDate: offer.lastTicketingDate,
        departure: {
          iataCode: departureSegment.departure.iataCode,
          at: departureSegment.departure.at,
        },
        arrival: {
          iataCode: arrivalSegment.arrival.iataCode,
          at: arrivalSegment.arrival.at,
        },
        price: {
          currency: offer.price.currency,
          total: offer.price.total,
          grandTotal: offer.price.grandTotal,
          billingCurrency: offer.price.billingCurrency,
        },
        traveler: flightOrder.travelers.map((traveler) => ({
          name: `${traveler.name.firstName} ${traveler.name.lastName}`,
          dateOfBirth: traveler.dateOfBirth,
          gender: traveler.gender,
          contact: {
            phone: traveler.contact.phones[0].number,
            email: traveler.contact.emailAddress,
          },
        })),
      };
    }),
  };

  return simplified;
}

///////////////////////
const amadeus = new Amaedus({
  clientId: process.env.AMAEDUS_KEY,
  clientSecret: process.env.AMAEDUS_SECRET,
  hostname: process.env.AMADEUS_HOST_NAME,
});

const API = axios.create({
  baseURL: process.env.AMAEDUS_API_ENDPOINT,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

// get flights
const getFligts = async (params) => {
  try {
    const flights = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: params.originLocationCode,
      destinationLocationCode: params.destinationLocationCode,
      departureDate: params.departureDate,
      adults: params.adults,
      currencyCode: "USD",
    });
    return flights;
  } catch (error) {
    throw error;
  }
};

// get airlines array
function getAllAirlineCarrierCodes(jsonData) {
  const carrierCodes = [];

  for (const flightOffer of jsonData) {
    for (const segment of flightOffer.itineraries[0].segments) {
      const airlineCode = segment.carrierCode;
      if (!carrierCodes.includes(airlineCode)) {
        carrierCodes.push(airlineCode);
      }
    }
  }

  return carrierCodes;
}

const getFlightsController = async (req, res) => {
  try {
    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults,
      nonStop,
      maxLength,
      returnDate,
      minPrice,
      maxPrice,
      includedAirlineCodes,
      travelClass,
    } = req.body;
    console.log(req.body);
    if (
      !originLocationCode ||
      !destinationLocationCode ||
      !departureDate ||
      !adults
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const params = {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults,
      nonStop,
      travelClass,
      returnDate,
      max: 250,
      currencyCode: "USD",
    };
    if (returnDate) {
      params.returnDate = returnDate;
    }

    if (maxPrice) {
      params.maxPrice = maxPrice;
    }
    if (includedAirlineCodes) {
      params.includedAirlineCodes = includedAirlineCodes;
    }
    if (maxLength) {
      params.max = maxLength;
    }
    const flights = await getFligts(params);
    const responseData = {
      flights: flights.data,
      dictionaries: flights.dictionaries,
    };
    const airlinesCodes = await getAllAirlineCarrierCodes(responseData.flights);

    responseData.airlinesCodes = airlinesCodes;

    res.status(200).json(responseData);
  } catch (error) {
    console.log("ERROR RESPONSE---------------------------------");
    console.log(error);
    console.log("ERROR RESPONSE---------------------------------");
    res.status(500).json({ message: error });
  }
};

// payments api for booking
const bookFlightController = async (req, res) => {
  try {
    if (!req.user) throw "User not found";
    // Get User Information for Booking
    const user = await User.findById(req.user.userId).populate("profileId");
    // Split user information for the contact information
    const firstName = user.fullName.split(" ")[0];
    const lastName = user.fullName.split(" ")[1];
    const commission = 30
    const { flightOffer, travelers, cardInfo, career, aircraftCode, couponCode,total } = req.body;

    // Get pricing Object to create Order for amadues flight booking
    if(couponCode){
      const getCoupon = await Vouchers.findOne({code:couponCode})
      if(!getCoupon){
        return res.status(404).json({message:"Coupon not found"})
      }
      const updateCoupon =await  Voucher.findByIdAndUpdate(getCoupon._id,{users:{$push: req.user.userId}})
    }
    const getPricicng = await amadeus.shopping.flightOffers.pricing.post(
      JSON.stringify({
        data: {
          type: "flight-offers-pricing",
          flightOffers: [flightOffer],
        },
      })
    );
    const pricing = getPricicng.result.data.flightOffers[0];

    // Booking Flight on amadeus
    const booking = await amadeus.booking.flightOrders.post(
      JSON.stringify({
        data: {
          type: "flight-order",
          flightOffers: [pricing],
          travelers: travelers,
          remarks: {},
          ticketingAgreement: {
            option: "DELAY_TO_CANCEL",
            delay: "6D",
          },
          contacts: [
            {
              addresseeName: {
                firstName: firstName,
                lastName: lastName,
              },

              purpose: "STANDARD",

              emailAddress: user.email,
              address: {
                lines: ["Calle Prado, 16"],
                postalCode: "28014",
                cityName: "Madrid",
                countryCode: "ES",
              },
            },
          ],
        },
      })
    );
    

    /////
    //calculate discount percentage
    
    const simplify = simplifyFlightOrder(booking.result.data);
    simplify.career = career;
    simplify.aircraftCode = aircraftCode;
    // Booking completed successfully
    const saveBooking = await UserBooking.create({
      bookingInfo: simplify,
      bookingType: "flight",
      paymentAmount: `${parseInt(total)} ${flightOffer.price.currency}`,
      paymentMethod: "stripe",
      customer: new mongoose.Types.ObjectId(req.user.userId),
    });

    // Fetch User Cards
    const fetchCard = await Card.findById(cardInfo.cardId);
    if (!fetchCard) throw "Card not found";
    const decipherCardNumber = decrypt(fetchCard.cardNumber);

    console.log(
      decipherCardNumber,
      fetchCard.expiryMonth,
      fetchCard.expiryYear,
      cardInfo.cardCVV
    );
    let token = null;
    if (process.env.NODE_ENV == "production") {
      token = await createStripeToken({
        cardNumber: decipherCardNumber,
        expMonth: fetchCard.expiryMonth,
        expYear: fetchCard.expiryYear,
        cvc: cardInfo.cardCVV,
      });
    }

    // Create TrX for Stripe

    const stripeTrx = await stripe.charges.create({
      amount: parseInt(total) * 100,
      currency: flightOffer.price.currency,
      source: token ? token : "tok_visa",
      description: "Flight Booking",
    });

    // Create a transaction in order to check the transaction
    const saveTransaction = await Transaction.create({
      amount: total,
      currency: flightOffer.price.currency,
      booking: new mongoose.Types.ObjectId(saveBooking._id),
      customer: new mongoose.Types.ObjectId(req.user.userId),
      status: "paid",
      transactionType: "flight",
      transactionDate: new Date(),
      trxId: stripeTrx.id,
    });

    res
      .status(200)
      .json({ booking: saveBooking, transaction: saveTransaction });
  } catch (error) {
    res.status(500).json({
      error: error,
    });
    console.log(error);
  }
};
// booking details controller
const getBookingDetails = async (req, res) => {
  try {
    if (!req.user) throw new Error("User not found");
    console.log(req.user);
    const user = await User.findById(req.user.userId).populate("cards");
    console.log(user);
    const { id } = req.params;
    const booking = await amadeus.booking.flightOrder(id).get();
    res.status(200).json(booking.result);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
};

const flightsRouter = express.Router();
flightsRouter.post("/", getFlightsController);
flightsRouter.post("/booking", auth, bookFlightController);
flightsRouter.get("/booking/:id", auth, getBookingDetails);
export default flightsRouter;
