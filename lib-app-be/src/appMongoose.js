const { connect } = require("mongoose");

const MONGO_DB_URL =
  "mongodb+srv://rashisingh23:Mongo1234@ciphers.8hnjder.mongodb.net";

const DB_NAME = "cs-library-app";

const connectDb = async () => {
  try {
    await connect(`${MONGO_DB_URL}/${DB_NAME}`);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
  }
};

connectDb();

module.exports = {};