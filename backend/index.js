const express = require("express");
const app = express();
const cors = require("cors");

const mongoose = require("mongoose");
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

const bookRoutes = require("./src/books/book.route");
const orderRoutes = require("./src/orders/order.route");
const userRoutes = require("./src/users/user.route");
const adminRoutes = require("./src/stats/admin.stats");

// Yeni eklenen cart route
const cartRoutes = require("./src/cart/cartRoutes");

// Yeni eklenen favorites route
const favoritesRoutes = require("./src/favorites/favorites.route");

// Yeni eklenen review route (dosya adı: review.Routes.js)
const reviewRoutes = require("./src/reviews/review.Routes.js");

// Yeni eklenen address route (dosya yolu: src/address/addressRoutes.js)
const addressRoutes = require("./src/address/addressRoutes.js");

// Yeni eklenen payment method route (dosya yolu: src/PaymentMethod/PaymentMethod.route.js)
const paymentMethodRoutes = require("./src/PaymentMethod/PaymentMethod.route.js");

app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payment-method", paymentMethodRoutes);

async function main() {
  await mongoose.connect(process.env.DB_URL);
  app.use("/", (req, res) => {
    res.json({ message: "Book Store Server is running!" });
  });
}

main()
  .then(() => console.log("Mongodb connected successfully!"))
  .catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
