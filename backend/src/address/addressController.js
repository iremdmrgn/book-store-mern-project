const Address = require('./Address');

// Kullanıcının tüm adreslerini getirir
exports.getAddresses = async (req, res) => {
  const { userId } = req.params;
  try {
    const addresses = await Address.find({ userId });
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Yeni adres ekler
exports.addAddress = async (req, res) => {
  const { userId } = req.params;
  const newAddress = req.body; // newAddress: title, street, city, district, neighborhood, postalCode, country
  try {
    const address = new Address({ userId, ...newAddress });
    await address.save();
    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Belirli bir adresi günceller
exports.updateAddress = async (req, res) => {
  const { userId, addressId } = req.params;
  const updateData = req.body;
  try {
    const address = await Address.findOneAndUpdate(
      { _id: addressId, userId },
      updateData,
      { new: true }
    );
    if (!address) return res.status(404).json({ message: "Address not found" });
    res.status(200).json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Belirli bir adresi siler
exports.deleteAddress = async (req, res) => {
  const { userId, addressId } = req.params;
  try {
    const address = await Address.findOneAndDelete({ _id: addressId, userId });
    if (!address) return res.status(404).json({ message: "Address not found" });
    res.status(200).json({ message: "Address deleted", address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
