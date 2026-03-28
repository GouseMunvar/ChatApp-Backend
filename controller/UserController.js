import bcrypt from "bcryptjs";
import User from "../models/User.js"; 
import { generateToken } from "../lib/Utils.js";
import cloudinary from "../lib/cloudinary.js";




export const signup = async (req, res) => {
  try {
    const { email, fullName, password, bio, profilePic } = req.body;

    // Validate required fields
    if (!email || !fullName || !password) {
      return res.status(400).json({ message: "Email, Full Name, and Password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      email,
      fullName,
      password: hashedPassword,
      bio,
      profilePic,
    });

    // ✅ Don’t generate token here; just confirm registration
    res.status(201).json({
      message: "User registered successfully. Please log in to continue.",
      user: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        bio: newUser.bio,
        profilePic: newUser.profilePic,
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and Password are required" });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                bio: user.bio,
                profilePic: user.profilePic
            },
            token
        });

    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const updateProfile = async (req, res) => {
  try {
    const { fullName, bio } = req.body;
    const userId = req.user._id;

    let updateData = {
      fullName,
      bio,
    };

    // If file uploaded
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "profile_pics",
      });

      updateData.profilePic = upload.secure_url;
    }

    const updateUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updateUser._id,
        email: updateUser.email,
        fullName: updateUser.fullName,
        bio: updateUser.bio,
        profilePic: updateUser.profilePic,
      },
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};





