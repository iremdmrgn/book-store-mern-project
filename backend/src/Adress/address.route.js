const express = require("express");
const router = express.Router();
const Address = require("./address.model"); // Address modelini import ediyoruz
const mongoose = require("mongoose"); // Mongoose'u import ediyoruz

// Adres ekleme endpoint'i
router.post("/add-address", async (req, res) => {
  const { street, city, state, postalCode, country, userId } = req.body;
  try {
    const newAddress = new Address({
      userId,
      street,
      city,
      state,
      postalCode,
      country,
      createdAt: new Date(),
    });
    await newAddress.save(); // MongoDB'ye kaydet
    res.status(201).json(newAddress);
  } catch (error) {
    console.error("Error saving address:", error);
    res.status(500).json({ message: "Error saving address", error: error.message });
  }
});

// Adresleri kullanıcıya göre getirme endpoint'i
router.get("/addresses", async (req, res) => {
  try {
    // UserId'yi populate() ile ilişkilendiriyoruz
    const addresses = await Address.find().populate("userId");  // populate ile userId'yi al

    if (addresses.length > 0) {
      res.status(200).json(addresses); // Adresleri döndür
    } else {
      res.status(404).json({ message: "No addresses found" });
    }
  } catch (error) {
    console.error("Error retrieving addresses:", error);
    res.status(500).json({ message: "Error retrieving addresses", error: error.message });
  }
});

// `userId`'yi doğru şekilde kullanarak adresleri sorgulama
router.get("/addresses/:userId", async (req, res) => {
  const userId = req.params.userId;
  console.log("Requested userId:", userId);

  try {
    // Instead of ObjectId conversion, we query directly with the string userId (since Firebase userId is a string)
    const addresses = await Address.find({ userId: userId });

    if (addresses.length > 0) {
      res.status(200).json(addresses); // Return addresses if found
    } else {
      console.log("No addresses found for this user.");
      res.status(404).json({ message: "No addresses found for this user." });
    }
  } catch (error) {
    console.error("Error retrieving addresses:", error);
    res.status(500).json({ message: "Error retrieving addresses", error: error.message });
  }
});

module.exports = router;