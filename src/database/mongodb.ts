import mongoose from "mongoose"
import config from "../config"

export const connectMongo = async () => {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log("Mongo DB connected successfully")
    } catch (error) {
        console.log(`Failed to connect Mongo DB : ${error}`);
        process.exit(1);
    }
}

