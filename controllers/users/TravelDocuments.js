import TravelInformation from "../../models/users/TravelDocuments.js";
import User from "../../models/users/user.js";

export const addTravelInformation = async (req, res) => {
  const { passportNumber, expirationDate, nationality } = req.body;
  const { userId } = req.user;

  try {
    const existingTravelInfo = await TravelInformation.findOne({
      passportNumber,
    });
    if (existingTravelInfo) {
      return res
        .status(409)
        .json({ message: "Passport number already exists" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newTravelInformation = new TravelInformation({
      passportNumber,
      expirationDate,
      nationality,
      createdBy: user._id,
    });

    const savedTravelInformation = await newTravelInformation.save();
    res.status(201).json(savedTravelInformation);
  } catch (error) {
    console.error("Error adding travel information:", error);
    res.status(500).json({ message: "Failed to add travel information" });
  }
};

export const getAllTravelInformation = async (req, res) => {
  const { userId } = req.user;

  try {
    const travelInformation = await TravelInformation.find({
      createdBy: userId,
    });
    res.status(200).json(travelInformation);
  } catch (error) {
    console.error("Error fetching travel information:", error);
    res.status(500).json({ message: "Failed to fetch travel information" });
  }
};

export const updateTravelInformation = async (req, res) => {
  const { userId } = req.user;
  const { passportNumber, expirationDate, nationality, travelInfoId } =
    req.body;

  console.log(req.body);

  try {
    const travelInformation = await TravelInformation.findById(travelInfoId);
    if (!travelInformation) {
      return res.status(404).json({ message: "Travel information not found" });
    }

    if (travelInformation.createdBy.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to update travel information" });
    }

    travelInformation.passportNumber = passportNumber;
    travelInformation.expirationDate = expirationDate;
    travelInformation.nationality = nationality;

    const updatedTravelInformation = await travelInformation.save();

    res.status(200).json(updatedTravelInformation);
  } catch (error) {
    console.error("Error updating travel information:", error);
    res.status(500).json({ message: "Failed to update travel information" });
  }
};
