const Address = require("./address.model"); // Model dosyasını import ediyoruz

// Adres ekleme fonksiyonu
const addAddress = async (req, res) => {
  const { street, city, state, postalCode, country, userId } = req.body;

  console.log("Received address data:", req.body);

  if (!street || !city || !state || !postalCode || !country || !userId) {
    console.log("Missing required fields");
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    console.log("Preparing to create new address...");

    const newAddress = new Address({
      userId,
      street,
      city,
      state,
      postalCode,
      country,
      createdAt: new Date(),
    });

    console.log("Address to be saved:", newAddress);

    // Veritabanına kaydediyoruz
    const savedAddress = await newAddress.save();
    console.log("Address saved successfully:", savedAddress);

    // Başarıyla kaydedilen adresi döndürüyoruz
    return res.status(201).json(savedAddress);
  } catch (error) {
    console.error("Error saving address:", error);
    return res
      .status(500)
      .json({ message: "Error saving address", error: error.message });
  }
};

// Adresleri getirme fonksiyonu (isteğe bağlı)
const getAddresses = async (req, res) => {
  console.log("Fetching addresses for userId:", req.params.userId);

  try {
    const addresses = await Address.find({ userId: req.params.userId });

    if (addresses.length === 0) {
      console.log("No addresses found for userId:", req.params.userId);
      return res.status(404).json({ message: "No addresses found." });
    }

    console.log("Addresses found:", addresses);
    return res.status(200).json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return res
      .status(500)
      .json({ message: "Error fetching addresses", error: error.message });
  }
};

module.exports = { addAddress, getAddresses };
