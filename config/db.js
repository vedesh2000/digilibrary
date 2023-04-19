const mongoose = require("mongoose");
const connectDB = async () => {
    try {
      await mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
      });
  
      console.log("Connected to MongoDB");
    } catch (error) {
      console.log("Something went wrong with Database connection" , error);
      process.exit(1);
    }
  };
  
module.exports = connectDB;