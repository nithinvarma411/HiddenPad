import { connect } from "mongoose";

const connectDB = async () => {
    try {
        await connect(process.env.MONGO_URI)
        console.log("mongodb connected successfully");   
    } catch (error) {
        console.error("unable to connect to database", error);
    }
};

export default connectDB;