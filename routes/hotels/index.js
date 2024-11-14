import express from "express";
import axios from "axios";
import qs from "querystring";
import auth from "../../middlewares/auth/auth.js";
import Card from "../../models/users/cards.js";
import { decrypt } from "../../middlewares/auth/Encryptions.js";
import Amaedus from "amadeus";
import User from "../../models/users/user.js";
import UserBooking from "../../models/users/userBookings.js";
import Transaction from "../../models/users/transactions.js";
const hotelRouter = express.Router();
import mongoose from "mongoose";
import { stripe, createStripeToken } from "../../util/stripe.js";

////////////////////////
function simplifyHotelBooking(hotelOrder) {
  const booking = hotelOrder.hotelBookings[0];
  const hotel = booking.hotel;
  const hotelProviderInfo = booking.hotelProviderInformation;

  return {
    hotelName: hotel.name,
    hotelAddress: hotel.self,
    checkInDate: booking.hotelOffer.checkInDate,
    checkOutDate: booking.hotelOffer.checkOutDate,
    hotelProviderInformation: hotelProviderInfo,
  };
}

// Amadeus Configuration

const amadeus = new Amaedus({
  clientId: process.env.AMAEDUS_KEY,
  clientSecret: process.env.AMAEDUS_SECRET,
  hostname: process.env.AMADEUS_HOST_NAME,
});
//##################################################################

const API = axios.create({
  baseURL: process.env.AMAEDUS_API_ENDPOINT,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});
const getAddress = async (lng, lat) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    return response.data.display_name;
  } catch (err) {
    console.log(err);
    return null;
  }
};

/**
 * Asynchronously retrieves an access token using client credentials.
 *
 * @return {string} The access token retrieved from the API response.
 */
const getAcessToken = async () => {
  const data = qs.stringify({
    grant_type: "client_credentials",
    client_id: process.env.AMAEDUS_KEY,
    client_secret: process.env.AMAEDUS_SECRET,
  });
  console.log(data)

  try {
    const response = await API.post("/v1/security/oauth2/token", data,{
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    });
    return response.data.access_token;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves hotels based on country using the specified parameters and access token.
 *
 * @param {object} params - The parameters for the hotel search.
 * @param {string} access_token - The access token for authorization.
 * @return {Promise} The data returned from the hotel search API.
 */
const getHotelsBaseOnCountry = async (params, access_token) => {
  try {
    const response = await API.get(
      "/v1/reference-data/locations/hotels/by-city",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params: { ...params },
      }
    );
    return response.data;
  } catch (error) {
    console.log(
      "🚀 ~ getHotelsBaseOnCountry ~ error:",
      error.response.data.errors
    );
    throw error.response.data.errors[0].title;
  }
};

/**
 * Retrieves hotel details by ID using the provided access token.
 *
 * @param {string[]} ids - The ID of the hotel to retrieve details for.
 * @param {string} access_token - The access token for authorization.
 * @return {Promise} The data containing hotel details.
 */
const getHotelDetailById = async (ids, access_token) => {
  try {
    const response = await API.get(
      `/v3/shopping/hotel-offers?hotelIds=${[...ids]}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    console.log("🚀 ~ getHotelDetailById ~ response:", response.data);

    return response.data;
  } catch (err) {
    throw err;
  }
};

// get hotel ratings
const getHotelRatings = async (id, access_token) => {
  try {
    console.log("Getting Ratings--------------------");
    console.log("Getting rating for id ", id);
    console.log("Getting Ratings--------------------");
    const response = await API.get(
      `/v2/e-reputation/hotel-sentiments?hotelIds=${id}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("response.data", response.data);
    return response.data;
  } catch (err) {
    throw err;
  }
};

hotelRouter.post("/", async (req, res) => {
  const { cityCode } = req.body;
  try {
    const params = {
      cityCode: cityCode,
      radius: 10,
      radiusUnit: "KM",
      hotelSource: "ALL",
    };
    const access_token = await getAcessToken();
    const response = await getHotelsBaseOnCountry(params, access_token);
    const allHotelSearch = response.data;
    const hotelIds = allHotelSearch.map((hotel) => hotel.hotelId);

    const hotelOffers = await getHotelDetailById(hotelIds, access_token);
    console.log("🚀 ~ hotelRouter.post ~ hotelOffers:", hotelOffers);

    for (const hotel of hotelOffers.data) {
      const id = hotel.hotel.hotelId;
      const hotelRating = await getHotelRatings(id, access_token);
      const address = await getAddress(
        hotel.hotel.longitude,
        hotel.hotel.latitude
      );
      if (address) {
        hotel.hotel.address = address;
      }

      if (hotelRating.data) {
        const overallRating = (hotelRating.data[0].overallRating * 5) / 100;
        const numberOfReviews = hotelRating.data[0].numberOfReviews;
        hotel.hotel.rating = {
          rating: overallRating,
          reviews: numberOfReviews,
        };
      } else {
        hotel.hotel.rating = {
          rating: 0,
          reviews: 0,
        };
      }

      hotel.hotelRating = hotelRating;
    }

    console.log("allHotelSearch", hotelOffers);

    res.status(200).json(hotelOffers);
  } catch (err) {
    console.error(`Error in hotel search: `, err.response.data);
    res.status(400).json({ error: err });
  }
});

// getting single Hotels based on ID
hotelRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const access_token = await getAcessToken();
    const hotelOffers = await getHotelDetailById([id], access_token);
    const address = await getAddress(
      hotelOffers.data[0].hotel.longitude,
      hotelOffers.data[0].hotel.latitude
    );
    if (address) {
      hotelOffers.data[0].hotel.address = address;
    }
    const hotelRating = await getHotelRatings(id, access_token);
    if (hotelRating.data) {
      const overallRating = (hotelRating.data[0].overallRating * 5) / 100;
      const numberOfReviews = hotelRating.data[0].numberOfReviews;
      hotelOffers.data[0].hotel.rating = {
        rating: overallRating,
        reviews: numberOfReviews,
        ...hotelRating.data[0].sentiments,
      };
    } else {
      hotelOffers.data[0].hotel.rating = {
        rating: 0,
        reviews: 0,
      };
    }

    res.status(200).json(hotelOffers.data[0]);
  } catch (err) {
    console.error(`Error in hotel search: `, err.response.data);
    res.status(400).json({ error: err });
  }
});

hotelRouter.post("/booking", auth, async (req, res) => {
  const user = await User.findById(req.user.userId).populate("profileId");

  console.log(req.user);
  try {
    const { HotelOfferId, cardInfo, hotelAddress, total, couponCode } = req.body;
    if (!user) throw "User not found";
    if (!HotelOfferId) throw "Hotel Offer Id not found";
    if (!cardInfo) throw "CardId not found";
    const firstName = user.fullName.split(" ")[0];
    const lastName = user.fullName.split(" ")[1];
    const cards = await Card.findById(cardInfo.cardId);
    const decryptedCardNumber = decrypt(cards.cardNumber);
    const guest = [
      {
        tid: 1,
        title: "MR",
        firstName: firstName,
        lastName: lastName,
        phone: "+923333333333",
        email: user.email,
      },
    ];
    const bookingParams = {
      data: {
        type: "hotel-order",
        guests: guest,
        travelAgent: {
          contact: {
            email: user.email,
          },
        },
        roomAssociations: [
          {
            guestReferences: [
              {
                guestReference: "1",
              },
            ],
            hotelOfferId: HotelOfferId,
          },
        ],
        payment: {
          method: "CREDIT_CARD",
          paymentCard: {
            paymentCardInfo: {
              vendorCode: "VI",
              cardNumber: decryptedCardNumber,
              expiryDate: `${cards.expiryYear}-${cards.expiryMonth}`,
              holderName: cards.cardHolderName,
            },
          },
        },
      },
    };
    console.log(
      "🚀 ~ hotelRouter.post ~ bookingParams:",
      bookingParams.data.payment
    );

    const access_token = await getAcessToken();

    const BookingHotel = await API.post(
      "/v2/booking/hotel-orders",
      bookingParams,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const result = BookingHotel.data.data;
    console.log("🚀 ~ hotelRouter.post ~ result:", result);
    const commision = 30;
    const price =
      parseInt(result.hotelBookings[0].hotelOffer.price.total) + commision;

    const simpleData = simplifyHotelBooking(result);
    simpleData.hotelAddress = hotelAddress;
    let token;
    if (process.env.NODE_ENV == "production") {
    }
    const saveBooking = await UserBooking.create({
      bookingInfo: simpleData,
      bookingType: "hotel",
      paymentAmount: `${price} USD`,
      paymentMethod: "amadeus",
      customer: new mongoose.Types.ObjectId(req.user.userId),
    });
    
    const stripeTrx = await stripe.charges.create({
      amount: parseInt(commision * 100),
      currency: "USD",
      source: token ? token : "tok_visa",
      description: "Hotel Booking",
    });

    // Create a transaction in order to check the transaction
    const saveTransaction = await Transaction.create({
      amount: commision,
      currency: "USD",
      booking: new mongoose.Types.ObjectId(saveBooking._id),
      customer: new mongoose.Types.ObjectId(req.user.userId),
      status: "paid",
      transactionType: "hotel",
      transactionDate: new Date(),
      trxId: stripeTrx.id,
    });

    res.status(200).json({ bookingStatus: "SUCCESS", booking: saveBooking });
  } catch (err) {
    console.log(err.response.data);
    res
      .status(500)
      .json({ bookingStatus: "FAILED", error: "Internal Server Error" });
  }
});

export default hotelRouter;
