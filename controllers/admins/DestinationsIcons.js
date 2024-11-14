import DestinationIcon from "../../models/Admins/Destinationsicons.js";

// Get all destination icons
export const getAllIcons = async (req, res) => {
  try {
    const icons = await DestinationIcon.find();
    res.json(icons);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch icons" });
  }
};

// Get a single destination icon by ID
export const getIconById = async (req, res) => {
  try {
    const icon = await DestinationIcon.findById(req.params.id);
    if (!icon) {
      return res.status(404).json({ error: "Icon not found" });
    }
    res.json(icon);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch icon" });
  }
};

// Create a new destination icon
export const createIcon = async (req, res) => {
  const { name, imageUrl } = req.body;

  if (!name || !imageUrl) {
    return res.status(400).json({ error: "Name and image URL are required" });
  }

  try {
    const newIcon = new DestinationIcon({ name, imageUrl });
    const savedIcon = await newIcon.save();
    res.status(201).json(savedIcon);
  } catch (error) {
    res.status(500).json({ error: "Failed to create icon" });
  }
};

// Update an existing destination icon
export const updateIcon = async (req, res) => {
  const { name, imageUrl } = req.body;

  try {
    const updatedIcon = await DestinationIcon.findByIdAndUpdate(
      req.params.id,
      { name, imageUrl },
      { new: true, runValidators: true }
    );

    if (!updatedIcon) {
      return res.status(404).json({ error: "Icon not found" });
    }

    res.json(updatedIcon);
  } catch (error) {
    res.status(500).json({ error: "Failed to update icon" });
  }
};

// Delete a destination icon
export const deleteIcon = async (req, res) => {
  try {
    const deletedIcon = await DestinationIcon.findByIdAndDelete(req.params.id);

    if (!deletedIcon) {
      return res.status(404).json({ error: "Icon not found" });
    }

    res.json({ message: "Icon deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete icon" });
  }
};
