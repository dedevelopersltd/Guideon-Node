import axios from "axios";
import express from "express"
const router = express.Router()
import dotenv from "dotenv"
dotenv.config()




// controllers 
const getCoordinatesByLocation = async (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ message: "Address is missing" });
  if (!address.lenght > 4) return res.status(400).json({ message: "Address is too short" });

  try {
    const apiKey = process.env.LOCATION_IQ_KEY;
    const url = `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(
      address
    )}&format=json`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error(error.errors);
    res.json([]);
  }
};


//routes 
router.post('/get-coordinates', getCoordinatesByLocation)
export default router
