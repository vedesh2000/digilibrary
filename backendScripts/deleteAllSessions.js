console.log('NODE_ENV:', process.env.NODE_ENV);
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: require('find-config')('.env') });
}

const connectDB = require("../config/db");
const mongoURI = process.env.DATABASE_URL;

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
  uri: mongoURI,
  collection: "mySessions",
});

// Function to delete all sessions
async function deleteAllSessions() {
  try {
    await connectDB();
    await new Promise((resolve, reject) => {
      store.clear((error) => {
        if (error) {
          console.error('Error deleting sessions:', error);
          reject(error);
        } else {
          console.log('All sessions deleted successfully');
          resolve();
        }
      });
    });
  } catch (err) {
    console.log(err);
    console.log("Error connecting to db");
  } finally {
    // Close the MongoDB connection
    if (store.client) {
      store.client.close();
    }
    process.exit(); // Exit the terminal
  }
}

// Call the function to delete all sessions
deleteAllSessions();
