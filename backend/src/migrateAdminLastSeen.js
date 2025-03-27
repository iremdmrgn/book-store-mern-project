const mongoose = require('mongoose');
const User = require('./users/user.model');
 // User modelinizin doğru yolunu belirtin
require('dotenv').config();

const DB_URL = process.env.DB_URL; // .env dosyanızda DB_URL tanımlı olsun

mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB. Starting migration...");
    const result = await User.updateMany(
      { role: "admin", lastSeenOrderCount: { $exists: false } },
      { $set: { lastSeenOrderCount: 0 } }
    );
    console.log(`Migration completed. Modified documents: ${result.modifiedCount}`);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error("Migration error:", err);
    mongoose.disconnect();
  });
