const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const port = process.env.PORT || 5000;
require("dotenv").config();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://book-app-frontend-tau.vercel.app"
    ],
    credentials: true,
  })
);

// Serve static files from the "public" folder.
app.use(express.static(path.join(__dirname, "public")));

// Import routes
const bookRoutes = require("./src/books/book.route");
const orderRoutes = require("./src/orders/order.route"); // Updated order routes
const userRoutes = require("./src/users/user.route");
const adminRoutes = require("./src/stats/admin.stats");
const cartRoutes = require("./src/cart/cartRoutes");
const favoritesRoutes = require("./src/favorites/favorites.route");
const reviewRoutes = require("./src/reviews/review.Routes.js");
const addressRoutes = require("./src/address/addressRoutes.js");
const paymentMethodRoutes = require("./src/PaymentMethod/PaymentMethod.route.js");
const accountRoutes = require("./src/account/account.routes");
const dashboardRoutes = require("./src/dashboard/dashboardRoutes");
// Import notifications routes
const notificationRoutes = require("./src/notifications/notificationRoutes");

// Mount routes
app.use("/api/account", accountRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payment-method", paymentMethodRoutes);
app.use("/api/dashboard", dashboardRoutes);
// Mount notifications route
app.use("/api/notifications", notificationRoutes);

// Default route
app.use("/", (req, res) => {
  res.json({ message: "Book Store Server is running!" });
});

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Mongodb connected successfully!"))
  .catch((err) => console.log(err));

// Create HTTP server and integrate Socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://book-app-frontend-tau.vercel.app"
    ],
    credentials: true,
  }
});

// Store the io instance in the Express app for access in controllers
app.set("socketio", io);

// Socket.io connection event
io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
