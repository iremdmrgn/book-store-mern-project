const Account = require('./account.model');

const syncAccount = async (req, res) => {
  try {
    const { uid, firstName, lastName, email, phone } = req.body;
    // Using findOneAndUpdate with upsert: true creates or updates the account based on the Firebase UID.
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
    // Use uid from the URL parameter (Firebase UID)
    const { uid } = req.params;
    const { firstName, lastName, email, phone } = req.body;
    // Using upsert: true so if no document is found, a new one is created.
    const updatedAccount = await Account.findOneAndUpdate(
      { uid },
      { firstName, lastName, email, phone },
      { new: true, upsert: true, runValidators: true }
    );
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
