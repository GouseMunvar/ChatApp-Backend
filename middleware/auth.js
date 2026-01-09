import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
    try {
        let token;

        // Check for token in headers
        if (
            req.headers.authorization && 
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request (excluding password)
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next(); // ✅ move to the next middleware/route handler
    } catch (error) {
        console.error("Auth error:", error);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};


export const checkAuth = async (req, res, next) => {
    res.json({ message: "You are authenticated", user: req.user });
};