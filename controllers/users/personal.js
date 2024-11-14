// personalInfoController.js
import PersonalInfo from "../../models/users/personal.js";
import User from "../../models/users/user.js";
import generateToken from "../../util/tokengenrator.js";

export const createPersonalInfo = async (req, res) => {
  try {
    const {
      email,
      countryOfResidence,
      cityOfResidence,
      bio,
      spokenLanguages,
      identificationDocuments,
    } = req.body;

    const existingUser = await User.findOne({ email })
      .select("-password")
      .populate("profileId experiencePoint");
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPersonalInfo = new PersonalInfo({
      countryOfResidence,
      cityOfResidence,
      bio,
      spokenLanguages,
      identificationDocuments,
    });

    const savedPersonalInfo = await newPersonalInfo.save();

    existingUser.profileId = savedPersonalInfo._id;
    await existingUser.save();

    const Updateuser = await User.findOne({ email })
      .select("-password")
      .populate("profileId experiencePoint");

    const token = generateToken({
      userId: Updateuser?._id,
      isAdmin: Updateuser?.isAdmin,
      verified: Updateuser?.isVerified,
    });

    res.status(201).json({
      message: "Personal information updated successfully",
      user: Updateuser,
      token: existingUser.socail === true ? token : "",
    });
  } catch (error) {
    console.error("Error creating personal information:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId)
      .populate("profileId")
      .populate("experiencePoint");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userObject = user.toObject();
    delete userObject.password;

    const Object = {
      Name: userObject?.fullName || "",
      Username: userObject?.username || "",
      Email: userObject?.email || "",
      bio: userObject?.profileId?.bio || "",
      Phone: userObject?.phoneNumber || "",
      dob: userObject?.profileId?.dob || "",
      Gender: userObject?.profileId?.gender || "",
      language: userObject?.profileId?.spokenLanguages || "",
    };

    res.status(200).json({ user: Object, AccType: userObject?.socail });
  } catch (error) {
    console.error("Error fetching user information:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePersonalInfo = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId)
      .populate("profileId")
      .populate("experiencePoint");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const fieldsToUpdate = req.body;

    const { Name, Phone } = fieldsToUpdate;
    if (Name) user.fullName = Name;
    if (Phone) user.phoneNumber = Phone;
    const existingUsername = await User.findOne({
      username: fieldsToUpdate.Username,
    });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const existingEmail = await User.findOne({ email: fieldsToUpdate.Email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already taken" });
    }

    // Update email if provided
    if (fieldsToUpdate.Email) {
      user.email = fieldsToUpdate.Email;
    }

    // Update username if provided
    if (fieldsToUpdate.Username) {
      user.username = fieldsToUpdate.Username;
    }
    await user.save();

    // Update profile information
    const profileFieldsToUpdate = fieldsToUpdate;
    if (user.profileId && profileFieldsToUpdate) {
      const {
        dob,
        Gender,
        language,
        countryOfResidence,
        cityOfResidence,
        bio,
        identificationDocuments,
        coverPicture,
      } = profileFieldsToUpdate;
      if (dob) user.profileId.dob = dob;
      if (Gender) user.profileId.gender = Gender;
      if (language) user.profileId.spokenLanguages = language;
      if (countryOfResidence)
        user.profileId.countryOfResidence = countryOfResidence;
      if (cityOfResidence) user.profileId.cityOfResidence = cityOfResidence;
      if (bio) user.profileId.bio = bio;
      if (identificationDocuments)
        user.profileId.identificationDocuments = identificationDocuments;
      if (coverPicture) user.profileId.coverPicture = coverPicture;
      await user.profileId.save();
    }

    res.status(200).json({ message: "Information updated successfully" });
  } catch (error) {
    console.error("Error updating user information:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
