import mongoose from "mongoose";

export const connectDB = async () => {
    const primary = process.env.MONGO_URL;
    const fallback = "mongodb://127.0.0.1:27017/expenseTracker";

    try {
        const uri = primary || fallback;
        const { connection } = await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log(`MongoDB Connected to ${uri}`);
        return connection;
    } catch (err) {
        console.error("Primary MongoDB connection failed:", err.message);
        if (primary) {
            // try fallback only if primary was provided
            try {
                const { connection } = await mongoose.connect(fallback, { useNewUrlParser: true, useUnifiedTopology: true });
                console.log(`MongoDB Connected to fallback ${fallback}`);
                return connection;
            } catch (err2) {
                console.error("Fallback MongoDB connection also failed:", err2.message);
            }
        }

        console.error("Proceeding without a database connection. Some features may not work.");
        return null;
    }

}