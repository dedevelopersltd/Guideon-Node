import ExperiencePoint from "../../models/users/experiencePoints.js";
import User from "../../models/users/user.js";

export const updateExperiencePoints = async (req, res) => {
  const { userId } = req.user;
  const { xp: newXP } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const experiencePoint = await ExperiencePoint.findById(
      user.experiencePoint
    );

    if (!experiencePoint) {
      return res.status(404).json({ message: "Experience point not found" });
    }

    const existingXP = parseInt(experiencePoint.xp);

    experiencePoint.xp = (existingXP + parseInt(newXP)).toString();

    await experiencePoint.save();

    res.status(200).json({
      message: "Experience points updated successfully",
      experiencePoint,
    });
  } catch (error) {
    console.error("Error updating experience points:", error.message);
    res.status(500).json({ message: error.message });
  }
};
