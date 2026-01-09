

import User from "../models/User.js";
import Message from "../models/Message.js"; // ✅ import Message model
import cloudinary from '../lib/cloudinary.js';
import {io,userSocketMap} from '../server.js';


export const getUsersForSideBar = async (req, res) => {
  try {
    // Get all users except the logged-in one
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "-password"
    );

    // Add online/offline status
    const updatedUsers = users.map((user) => ({
      ...user._doc,
      onlineStatus: userSocketMap[user._id.toString()] ? true : false,
    }));

    // Prepare unseen message counts
    const unseenMessages = {};
    console.log(userSocketMap)
    for (const user of updatedUsers) {
      unseenMessages[user._id] = await Message.countDocuments({
        receiverId: req.user._id,
        senderId: user._id,
        seen: false,
      });
    }
    

  
    res.status(200).json({
      users: updatedUsers,
      unseenMessages,
    });
  } catch (error) {
    console.error("Error fetching sidebar users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};





export const getMessage = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params; // chat partner's ID
        const myId = req.user._id;
        console.log("Fetching messages between", myId, "and", selectedUserId);

        // Fetch all messages between me and the selected user
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 }); // sort by time ascending
        
        await Message.updateMany({senderId:selectedUserId,receiverId:myId,seen:false},{$set:{seen:true}})
        res.status(200).json({
            success: true,
            messages
        });
        console.log("Fetched messages:", messages);

    } catch (error) {
        console.error("Error fetching messages:", error.message);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

export const markMessageAsSeen=async(req,res)=>{
    try{
        const {id}=req.params;
        const myId=req.user._id;

        await Message.updateMany({senderId:id,receiverId:myId,seen:false},{$set:{seen:true}})

        res.json({message:"Messages marked as seen"})

    }
    catch (error) {
        console.error("Error fetching messages:", error.message);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};


export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const senderId = req.user._id;
        const receiverId = req.params.id;

        if (!text && !image) {
            return res.status(400).json({
                success: false,
                message: "Message must contain text or image"
            });
        }

        let imageUrl = null;

        // If there's an image, upload it to Cloudinary
        if (image) {
            const uploadedImage = await cloudinary.uploader.upload(image, {
                folder: "chat_images"
            });
            imageUrl = uploadedImage.secure_url;
        }

        // Create the new message
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });
        // Emit the message to the receiver if they are online

        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: newMessage
        });

        console.log("Sent message:", newMessage);

    } catch (error) {
        console.error("Error sending message:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const deleteChat = async (req, res) => {
  try {
    const myId = req.user._id;        // from protected route
    const { id: otherUserId } = req.params;

    // Delete all messages between both users
    await Message.deleteMany({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId }
      ]
    });

    // Notify the other user in realtime
    const receiverSocketId = userSocketMap[otherUserId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("chatDeleted", {
        deletedBy: myId
      });
    }

    res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });

  } catch (error) {
    console.error("Delete chat error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
