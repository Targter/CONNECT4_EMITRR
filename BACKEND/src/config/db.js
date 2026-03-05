import mongoose from "mongoose";
export const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URI);
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/connect4",
    );
    console.log("MongoDB Connected with ");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};
