import mongoos from "mongoose";


export const connectDB = async () => {
    try{
        await mongoos.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");
    }catch(error){
        console.error("MongoDB connection failed:", error);
        process.exit(1);
        }
    };
