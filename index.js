import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import s3Routes from "./routes/aws/s3Routes.js";
import userRoutes from "./routes/users/user.js";
import profileRoutes from "./routes/users/personal.js";
import ExperiencePointsRoutes from "./routes/users/Experiencepoints.js";
import TravelDocumentsRoutes from "./routes/users/TravelDocuments.js";
import CardsRoutes from "./routes/users/Cards.js";
import flightsRouter from "./routes/flights/index.js";
import hotelRouter from "./routes/hotels/index.js";
import messagesRoutes from "./routes/messages/messages.js";
import AdminRoutes from "./routes/admins/AdminRoutes.js";
import ExperienceRoutes from "./routes/admins/ExperiencePoints.js";
import DestinationRoutes from "./routes/admins/DestinationsRoutes.js";
import DestinationIconsRoutes from "./routes/admins/DestinationsIcons.js";
import CommissionRoutes from "./routes/admins/CommissionRoutes.js"
import FavouriteRoutes from "./routes/users/favourites.js";
import VoucherRoutes from "./routes/admins/Vouchers.js"
import { Server as SocketIOServer } from "socket.io";
import LocationsRouter from "./routes/admins/getCoordinates.js"
import http from "http";
// import getCoordinates from "./util/geocoder.js";
import axios from "axios";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/v1", userRoutes);
app.use("/api/v1", profileRoutes);
app.use("/api/v1", ExperiencePointsRoutes);
app.use("/api/v1", TravelDocumentsRoutes);
app.use("/api/v1", CardsRoutes);
app.use("/api/s3", s3Routes);
app.use("/api/v1/flights", flightsRouter);
app.use("/api/v1/hotels", hotelRouter);
app.use("/api/v1/message", messagesRoutes);
app.use("/api/v1/favourites", FavouriteRoutes);

// =============== Admins Routes  ==============
app.use('/api/v1/admin/location',LocationsRouter)
app.use("/api/v1/admin/vouchers", VoucherRoutes); 
app.use("/api/v1/admin/comission", CommissionRoutes);
app.use("/api/v1/admin", AdminRoutes);
app.use("/api/v1/admin/xp", ExperienceRoutes);
app.use("/api/v1/admin/dest", DestinationRoutes);
app.use("/api/v1/admin/dest/manage", DestinationIconsRoutes);

app.get("/get-location/:location", async (req, res) => {
  try {
    const address = req.params.location;
    const apiKey = process.env.LOCATION_IQ_KEY
    const url = `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(
      address
    )}&format=json`;

    const result = await axios.get(url);
    console.log("🚀 ~ getLngLat ~ result:", result.data);

    if (result.data && result.data.length > 0) {
      res.json(result.data[0]);
    } else {
      res.status(404).send("No results found");
    }
  } catch (error) {
    console.error(error.errors);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// / Sockets ----------
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  console.log(global.onlineUsers);

  socket.on("add-user", async (userId) => {
    console.log("add-user", userId);
    onlineUsers.set(userId, socket.id);
    const users = await User.find();
    io.to(socket.id).emit("user-connected", { users });
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      io.to(sendUserSocket).emit("msg-recieve", data);
      io.to(socket.id).emit("msg-sent", data);
    }
  });
});

// get location
