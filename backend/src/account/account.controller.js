const Account = require('./account.model');

const getAccount = async (req, res) => {
  const { uid } = req.params;
  try {
    const account = await Account.findOne({ uid });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    console.log("Fetched account:", account);
    res.status(200).json(account);
  } catch (error) {
    console.error("Error fetching account:", error);
    res.status(500).json({ message: "Failed to fetch account" });
  }
};

const syncAccount = async (req, res) => {
  try {
    const { uid, firstName, lastName, email, phone } = req.body;
    // Using findOneAndUpdate with upsert: true creates or updates the account based on the Firebase UID.
    const account = await Account.findOneAndUpdate(
      { uid },
      { firstName, lastName, email, phone },
      { new: true, upsert: true, runValidators: true }
    );
    console.log("Synced account:", account);
    res.status(200).json(account);
  } catch (error) {
    console.error("Error syncing account:", error);
    res.status(500).json({ message: "Failed to sync account" });
  }
};

const updateAccount = async (req, res) => {
  try {
    const { uid } = req.params;
    const { firstName, lastName, email, phone } = req.body;
    const updatedAccount = await Account.findOneAndUpdate(
      { uid },
      { firstName, lastName, email, phone },
      { new: true, upsert: true, runValidators: true }
    );
    console.log("Updated account:", updatedAccount);
    res.status(200).json(updatedAccount);
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({ message: "Failed to update account" });
  }
};

module.exports = { getAccount, syncAccount, updateAccount };
