const express = require("express");
const app = express();
const all = require("./models/AllTables");
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const requestRoutes = require("./routes/requestRoutes");
const http = require("http");
const socketIO = require("socket.io");
const Vehicle = require("./models/Vehicle");
const Request=require("./models/require")
const server = http.createServer(app); // ✅ Attach HTTP server
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

//socket connection of real-time data

io.on("connection", (socket) => { // ✅ Fix variable name (socket, not Socket)
  console.log("New Client Connected");

  socket.on("updateLocation", async (data) => {
    const { id, latitude, longitude, status } = data;
    let vehicle = await Vehicle.findByPk(id);
    if (vehicle) {
      await vehicle.update({ latitude, longitude, status });
      io.emit("locationUpdated", { id, latitude, longitude, status });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
}));
app.use(express.json());

// Routes
app.use("/api/requests", requestRoutes);
app.use("/api/users", require("./routes/userRoutes"));

all
  .sync({ alter: true })
  .then(() => {
    console.log("Database & tables synced!");
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // ✅ Use `server.listen`
  })
  .catch((err) => console.error("Sync error:", err));

app.get("/", (req, res) => {
  res.send("Backend is running!");
});
