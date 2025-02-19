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
const addressRoutes = require("./src/Adress/address.route");
const paymentMethodRoutes = require("./src/PaymentMethod/PaymentMethod.route");
const getAddresses = require("./src/Adress/address.route");
const addAddress = require("./src/Adress/address.route");

app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/addresses/:userId", getAddresses);
app.use("/api/add-address", addAddress);
app.use("/api/payment-method", paymentMethodRoutes);

// Yönlendirme: /api/address adresine gelen istekleri /api/address/addresses adresine yönlendir
app.use("/api/address", (req, res) => {
  res.redirect("/api/address/addresses");
});

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
