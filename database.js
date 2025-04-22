import mongoose from "mongoose";

const connectToDb = async () => {
    try {
        mongoose.set("strictQuery", false);

        const connect = await mongoose.connect(process.env.MONGO_URI);

        console.log("database connected successfully");
    } catch (e) {
        console.log(e);
    }
};

export default connectToDb;
