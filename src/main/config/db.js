import { connect } from "mongoose";

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb+srv://nithinvarma411:hiddenpad2025@cluster0.7owqtgb.mongodb.net/hiddenpad"
        await connect(mongoURI);
        console.log("mongodb connected successfully");   
    } catch (error) {
        console.error("unable to connect to database", error);
    }
};

export default connectDB;