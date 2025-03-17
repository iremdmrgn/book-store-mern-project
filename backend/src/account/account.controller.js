// src/account/account.controller.js
const Account = require('./account.model');

const syncAccount = async (req, res) => {
  try {
    const { uid, firstName, lastName, email, phone } = req.body;

    // Using findOneAndUpdate with upsert: true creates or updates the account
    const account = await Account.findOneAndUpdate(
      { uid },
      { firstName, lastName, email, phone },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(account);
  } catch (error) {
    console.error("Error syncing account:", error);
    res.status(500).json({ message: "Failed to sync account" });
  }
};

const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone } = req.body;
    const updatedAccount = await Account.findByIdAndUpdate(
      id,
      { firstName, lastName, email, phone },
      { new: true, runValidators: true }
    );
    if (!updatedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.status(200).json(updatedAccount);
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({ message: "Failed to update account" });
  }
};

module.exports = {
  syncAccount,
  updateAccount,
};
