import ExperiencePoints from "../../models/Admins/ExperiencePoints.js";

export const createExperiencePoint = async (req, res) => {
  try {
    const { title, xp } = req.body;
    const newExperiencePoint = new ExperiencePoints({ title, xp });
    await newExperiencePoint.save();
    res.status(201).json(newExperiencePoint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all ExperiencePoints
export const getAllExperiencePoints = async (req, res) => {
  try {
    const experiencePoints = await ExperiencePoints.find({});
    res.status(200).json(experiencePoints);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

// Get a single ExperiencePoint by ID
export const getExperiencePointById = async (req, res) => {
  try {
    const { id } = req.params;
    const experiencePoint = await ExperiencePoints.findById(id);
    if (!experiencePoint) {
      return res.status(404).json({ message: "ExperiencePoint not found" });
    }
    res.status(200).json(experiencePoint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an ExperiencePoint by ID
export const updateExperiencePoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, xp } = req.body;
    const updatedExperiencePoint = await ExperiencePoints.findByIdAndUpdate(
      id,
      { title, xp },
      { new: true, runValidators: true }
    );
    if (!updatedExperiencePoint) {
      return res.status(404).json({ message: "ExperiencePoint not found" });
    }
    res.status(200).json(updatedExperiencePoint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an ExperiencePoint by ID
export const deleteExperiencePoint = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExperiencePoint = await ExperiencePoints.findByIdAndDelete(id);
    if (!deletedExperiencePoint) {
      return res.status(404).json({ message: "ExperiencePoint not found" });
    }
    res.status(200).json({ message: "ExperiencePoint deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
