import mongoose,{Types} from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    image:{type:String},
    seen:{type:Boolean,default:false},
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
