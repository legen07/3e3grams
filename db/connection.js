import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDb : ", mongoose.connection.name);

    return mongoose.connection;

  } catch( error) {
    console.error("Database connection error : ", error);
    throw error;
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log("Database disconnected. ")
  } catch (error) {
    console.error("Failed to disconnect. : ", error);
  }
}