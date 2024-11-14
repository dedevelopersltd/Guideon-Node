// userController.js
import User from "../../models/users/user.js";
import ExperiencePoint from "../../models/users/experiencePoints.js";
import { RandomCode } from "../../util/code.js";
import sendEmail from "../../util/sendEmail.js";
import generateToken from "../../util/tokengenrator.js";
import Messages from "../../models/users/messages.js";
import UserBooking from "../../models/users/userBookings.js";
import mongoose from "mongoose";
import axios from "axios";
import osm from "osm";
import {config} from "dotenv"
config()
// dotenv.config()

import {accountConfirmTemplate,passwordConfirmation,passwordReset} from "../../util/email-templates.js"
export const signup = async (req, res) => {
  try {
    const { fullName, username, email, phoneNumber, password, profilepic } =
      req.body;

    const existingUser = await User.findOne({ email:email.toLowerCase() });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        message:
          "This email is already associated with an account. Please log in",
      });
    }

    if (existingUser && existingUser?.isVerified === false) {
      return res.status(401).json({
        message:
          "Your account exists but is not yet verified. Please verify your account",
        email: existingUser.email,
      });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const verificationCode = RandomCode();

    const htmlContent = accountConfirmTemplate.replace("{{code}}", verificationCode);

    await sendEmail(email, "Verify Your Email", htmlContent);

    const newUser = new User({
      fullName,
      username,
      email,
      phoneNumber,
      password,
      profilepic,
      verificationCode,
    });

    const newExperiencePoint = new ExperiencePoint();
    await newExperiencePoint.save();

    newUser.experiencePoint = newExperiencePoint._id;
    await newUser.save();

    res.status(201).json({
      email,
      message: "Account created successfully, please verify your email.",
    });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Verify Emails

export const verifyEmail = async (req, res) => {
  try {
    const { verificationCode } = req.body;

    const user = await User.findOne({ verificationCode });

    if (!user) {
      return res.status(404).json({ message: "Invalid verification code" });
    }

    if (user.isVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    user.isVerified = true;
    user.verificationCodeStatus = false;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email:email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    const verificationCode = RandomCode();

    user.verificationCode = verificationCode;
    user.verificationCodeStatus = true;
    await user.save();

    const htmlContent = accountConfirmTemplate.replace("{{code}}", verificationCode);

    await sendEmail(email, "Resend Verification Code", htmlContent);

    return res
      .status(200)
      .json({ message: "Verification code resent successfully" });
  } catch (error) {
    console.error("Error resending verification code:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// Login User

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email:email.toLowerCase() }).populate(
      "profileId experiencePoint"
    );

    if (!user) {
      return res.status(404).json({ message: "Incorrect email or password." });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message:
          "Email not verified. Please verify your email before logging in.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    const token = generateToken({
      userId: user._id,
      isAdmin: user.isAdmin,
      verified: user.isVerified,
    });

    const userObject = user.toObject();
    delete userObject.password;

    res.json({ message: "Login successful", user: userObject, token });
  } catch (error) {
    console.error("Error logging in user:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Forgot password

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email:email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "Try with Valid Email" });
    }

    if (user.socail === true) {
      return res
        .status(404)
        .json({ message: "Your are unable to reset password" });
    }

    const verificationCode = RandomCode();

    user.resetCode = verificationCode;
    user.resetCodeStatus = true;
    await user.save();

    const htmlContent = passwordReset.replace("{{code}}", verificationCode);

    await sendEmail(email, "Reset Your Password", htmlContent);

    res.status(200).json({
      message: "Reset password instructions sent to your email",
    });
  } catch (error) {
    // Handle errors
    console.error("Error sending reset password email:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify Reset Email Code

export const verifyResetEmail = async (req, res) => {
  try {
    const { Otp } = req.body;

    const user = await User.findOne({ resetCode: Otp });

    if (!user) {
      return res.status(404).json({ message: "Invalid verification code" });
    }

    user.resetCodeStatus = false;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// Resend Reset Verification code

export const resendVerificationCodeReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email:email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const verificationCode = RandomCode();

    user.resetCode = verificationCode;
    user.resetCodeStatus = true;
    await user.save();

    const htmlContent = passwordReset.replace("{{code}}", verificationCode);

    await sendEmail(email, "Resend OTP Code", htmlContent);

    return res.status(200).json({ message: "OTP code resent successfully" });
  } catch (error) {
    console.error("Error resending OTP code:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// Reset Password

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email:email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user?.resetCodeStatus) {
      return res
        .status(401)
        .json({ message: "Please verified otp code first" });
    }

    if (user.resetCode === "") {
      return res.status(401).json({ message: "invalid Request" });
    }

    user.password = newPassword;
    user.resetCodeStatus = false;
    user.resetCode = "";
    await user.save();
    const htmlContent = passwordConfirmation;

    await sendEmail(email, "Resend OTP Code", htmlContent);
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update Settings

export const updateUserSettings = async (req, res) => {
  try {
    const { userId } = req.user;
    const { oldPassword, newPassword, notifications, profileStatus } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (notifications !== undefined) {
      user.notifications = notifications;
    }

    if (profileStatus) {
      user.profileStatus = profileStatus;
    }

    if (oldPassword && newPassword) {
      const isOldPasswordValid = await user.comparePassword(oldPassword);

      if (!isOldPasswordValid) {
        return res.status(401).json({ message: "Old password is incorrect" });
      }

      user.password = newPassword;
    }

    await user.save();

    return res
      .status(200)
      .json({ message: "User settings updated successfully" });
  } catch (error) {
    console.error("Error updating user settings:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserSettings = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(
      userId,
      "+password notifications profileStatus"
    ).exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const response = [
      {
        title: "Password",
        value: true,
      },
      {
        title: "Profile Privacy",
        value: user.profileStatus,
      },
      {
        title: "Notification",
        value: user.notifications,
      },
    ];

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching user settings:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get user Information

export const getUserInformation = async (req, res) => {
  const { userId } = req.user;

  try {
    const user = await User.findById(userId).populate(
      "profileId experiencePoint"
    );

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isVerified) {
      throw new Error(
        "Email not verified. Please verify your email before logging in."
      );
    }

    const userObject = user.toObject();
    delete userObject.password;

    return res.status(200).json({ user: userObject });
  } catch (error) {
    console.error("Error getting user information:", error.message);
    throw error;
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { profilepic } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (profilepic) user.profilepic = profilepic;

    await user.save();

    const updatedUser = await User.findById(userId).populate(
      "profileId experiencePoint"
    );
    delete updatedUser.password;

    return res.status(200).json({
      message: "Profile image updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile image:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// ============ Google Loginns =============

export const goolelogin = async (req, res) => {
  try {
    const { fullName, email, profilepic, name } = req.body;
    let username = `${name}${Math.floor(Math.random() * 999999) + 1000}`;

    const user = await User.find({ email: email }).populate(
      "profileId experiencePoint"
    );

    if (user.length === 0) {
      const newUser = new User({
        fullName,
        username,
        email,
        profilepic,
        verificationCode: 111111,
        isVerified: true,
        socail: true,
      });
      await newUser.save();
      const newExperiencePoint = new ExperiencePoint();
      await newExperiencePoint.save();

      newUser.experiencePoint = newExperiencePoint._id;
      await newUser.save();

      res.status(201).json({
        email,
        message: "Account created successfully",
      });
    }

    if (user.length > 0) {
      if (user[0].socail === true) {
        const token = generateToken({
          userId: user[0]?._id,
          isAdmin: user[0]?.isAdmin,
          verified: user[0]?.isVerified,
        });
        res
          .status(200)
          .json({ message: "Login successful", user: user[0], token });
      } else {
        res.status(409).json({
          message: "Account Already Exist please login with Email and password",
        });
      }
    }
  } catch (error) {
    console.error("Error updating profile image:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { userId } = req.user;

    const users = await User.find({ _id: { $ne: userId } }).select(
      "-password -verificationCode -cards -verificationCodeStatus -resetCodeStatus"
    );
    const response = [];
    for (const user of users) {
      const userMessages = await Messages.aggregate([
        {
          $match: {
            $and: [{ sender: user._id }, { "message.read": false }],
          },
        },
        {
          $match: {
            users: { $all: [userId] },
          },
        },
      ]);
      console.log(userMessages);
      const msgTime =
        userMessages.length > 0
          ? userMessages[userMessages.length - 1].createdAt
          : null;
      response.push({
        messageCount: userMessages.length,
        msgTime: msgTime,

        messageLast:
          userMessages.length > 0
            ? userMessages[userMessages.length - 1].message.text
            : null,
        ...user.toObject(),
      });
    }

    return res.status(200).json({ users: response });
  } catch (error) {
    console.error(
      "Error getting all users with unread message count:",
      error.message
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUsersInChats = async (req, res, next) => {
  const { userId } = req.user;
  try {
    const user = await User.findById(userId)
      .select(
        "-password -verificationCode -cards -verificationCodeStatus -resetCodeStatus"
      )
      .populate({
        path: "UserChats",
        select:
          "-password -verificationCode -cards -verificationCodeStatus -resetCodeStatus -UserChats",
      });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const usersInChats = user.UserChats.map(async (chat) => {
      const userData = { ...chat.toObject() };
      const userMessages = await Messages.find({
        users: { $all: [userId, chat._id] },
      });

      console.log(
        "Message ========================================================="
      );
      console.log(userMessages, chat.fullName);
      console.log(
        "Message ========================================================="
      );

      const unreadMessages = userMessages.filter(
        (message) =>
          !message.message.read && message.sender.toString() !== userId
      );
      const messageCount = unreadMessages.length;
      console.log(unreadMessages);

      const msgTime =
        userMessages.length > 0
          ? userMessages[userMessages.length - 1].createdAt
          : null;
      const lastMessage =
        userMessages.length > 0
          ? userMessages[userMessages.length - 1].message.text
          : null;

      userData.messageCount = messageCount;
      userData.msgTime = msgTime;
      userData.lastMessage = lastMessage;

      return userData;
    });

    const usersData = await Promise.all(usersInChats);

    return res.json({ users: usersData });
  } catch (ex) {
    next(ex);
  }
};
/**
 * Props
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const fetchAllUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "username fullName email profilepic"
    );
    return res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const fetchByUsername = async (req, res) => {
  try {
    const username = req.params.id;
    const query = { username: { $regex: new RegExp(`^${username}$`, "i") } };
    const user = await User.findOne(query).select({
      username: 1,
      fullName: 1,
      email: 1,
      profilepic: 1,
    });
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserBooking = async (req, res) => {
  const userId = req.user.userId;
  const bookingId = req.params.id;
  try {
    const booking = await UserBooking.findOne({
      _id: bookingId,
      customer: new mongoose.Types.ObjectId(userId),
    }).populate("customer");
    console.log("🚀 ~ getUserBooking ~ booking:", booking);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.send(booking);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

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

export const getAllSingleUserBooking = async (req, res) => {
  const userId = req.user.userId;
  const { type } = req.params;

  try {
    const booking = await UserBooking.find({
      customer: new mongoose.Types.ObjectId(userId),
      bookingType: type,
    }).populate("customer");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.send(booking);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getLngLat = async (address) => {
  try {
    console.log(address);
    const apiKey = process.env.LOCATION_IQ_KEY;
    const url = `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(
      address
    )}&format=json`;
    const response = await axios.get(url);
    console.log("🚀 ~ getLngLat ~ response:", response.data);

    return response.data[0];
  } catch (err) {
    console.log(err.message);
    return null;
  }
};
export const getExplorationsBookings = async (req, res) => {
  const userId = req.user.userId;
  try {
    const bookings = await UserBooking.find({
      customer: new mongoose.Types.ObjectId(userId),
    }).populate("customer");
    if (!bookings) {
      return res.status(404).json({ message: "Booking not found" });
    }
    console.log(
      "==================================================================================="
    );
    console.log("🚀 ~ getExplorationsBookings ~ bookings:", bookings);
    console.log(
      "==================================================================================="
    );
    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    let myBookings = [];
    for (const booking of bookings) {
      await sleep(3000);

      if (booking.bookingType === "hotel") {
        const address = await getLngLat(booking.bookingInfo.hotelAddress);
        if (!address) continue;
        myBookings.push({
          ...booking._doc,
          address,
        });
      } else {
        const [departure, arrival] = await Promise.all([
          getLngLat(
            `${booking.bookingInfo.flightOffers[0].departure.iataCode} airport`
          ),
          getLngLat(
            `${booking.bookingInfo.flightOffers[0].arrival.iataCode} airport`
          ),
        ]);
        if (!departure || !arrival) continue;
        myBookings.push({
          ...booking._doc,
          departure,
          arrival,
        });
      }

      await sleep(3000);
    }
    const hotels = [];
    const flights = [];
    for (const booking of myBookings) {
      if (booking.bookingType === "hotel") {
        hotels.push(booking);
      } else {
        flights.push(booking);
      }
    }

    res.send({ hotels, flights });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getAllUserBookings= async (req,res) =>{
  try {
    const hotelBookings = await UserBooking.find({ bookingType: "hotel" });
    const flightBookings = await UserBooking.find({ bookingType: "flight" });
    res.send({ hotels:hotelBookings, flights:flightBookings });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}