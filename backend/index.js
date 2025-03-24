const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require('path');
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://book-app-frontend-tau.vercel.app",
    ],
    credentials: true,
  })
);

// Statik dosyaların sunulması için "public" klasörünü tanımlıyoruz.
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const bookRoutes = require("./src/books/book.route");
const orderRoutes = require("./src/orders/order.route");
const userRoutes = require("./src/users/user.route");
const adminRoutes = require("./src/stats/admin.stats");
const cartRoutes = require("./src/cart/cartRoutes");
const favoritesRoutes = require("./src/favorites/favorites.route");
const reviewRoutes = require("./src/reviews/review.Routes.js");
const addressRoutes = require("./src/address/addressRoutes.js");
const paymentMethodRoutes = require("./src/PaymentMethod/PaymentMethod.route.js");
const accountRoutes = require("./src/account/account.routes");

// Dashboard route'larını ekleyelim
const dashboardRoutes = require("./src/dashboard/dashboardRoutes");

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

// Default route
app.use("/", (req, res) => {
  res.json({ message: "Book Store Server is running!" });
});

// MongoDB bağlantısı
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Mongodb connected successfully!"))
  .catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
