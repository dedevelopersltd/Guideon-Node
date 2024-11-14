import Destination from "../../models/Admins/Destinations.js";
import axios from "axios";
//get Whether
const getWhetherAPI = async (lat, lng) => {
  console.log(process.env.OPENWEATHER_API);
  const whether = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.OPENWEATHER_API}`;
  console.log(whether);
  try {
    const response = await axios.get(whether);
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// Create a new destination
export const createDestination = async (req, res) => {
  try {
    const newDestination = new Destination(req.body);
    await newDestination.save();
    res
      .status(201)
      .json({ newDestination, message: "Destination created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all destinations
export const getDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find().populate("icon");
 const countAverageRatings = destinations.map((destination) => {
  const { destinationRating, foodRating, securityRating,priceRating } = destination;
  const averageRating = (parseInt(destinationRating) + parseInt(foodRating) + parseInt(securityRating) + parseInt(priceRating)) / 4;
  return { ...destination._doc, averageRating };
 })
    res.status(200).json(countAverageRatings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single destination by ID
export const getDestinationById = async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: "Destination ID is required" });
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ error: "Destination not found" });
    }
    const { longitude, latitude } = destination;
    const weather = await getWhetherAPI(latitude, longitude);
    const DestinationWhether = { ...destination._doc, weather };
    // DestinationWhether.whetherData = whetherData;
    res.status(200).json(DestinationWhether);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a destination by ID
export const updateDestination = async (req, res) => {
  try {
    const updatedDestination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedDestination) {
      return res.status(404).json({ error: "Destination not found" });
    }
    res.status(200).json(updatedDestination);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a destination by ID
export const deleteDestination = async (req, res) => {
  try {
    const deletedDestination = await Destination.findByIdAndDelete(
      req.params.id
    );
    if (!deletedDestination) {
      return res.status(404).json({ error: "Destination not found" });
    }
    res.status(200).json({ message: "Destination deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const searchDestination = async (req, res) => {
  try {
    const regex = new RegExp(req.params.search, "i");
    const destinations = await Destination.find({ name: regex });
    res.status(200).json(destinations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
