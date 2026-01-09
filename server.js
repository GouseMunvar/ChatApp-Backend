import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';
import UserRouter from './routers/userRoutes.js';
import messageRouter from './routers/messageRoutes.js';
import { Server } from 'socket.io';
const app=express();
const server=http.createServer(app);

connectDB();
app.use(express.json({limit:"4mb"}))
app.use(cors());

export const io=new Server(server,{
  cors:{origin:"*"}

})

// Store onlin user

export const userSocketMap={}; //{userId:socketId}

io.on("connection",(socket)=>{
  const userId=socket.handshake.query.userId;
  console.log("user connect",userId);
  if(userId){
    userSocketMap[userId]=socket.id;
  }

  io.emit("getOnlineUsers",Object.keys(userSocketMap))

  socket.on("disconnect",()=>{
    console.log(userId,"disconnected");
    delete userSocketMap[userId];
    io.emit("getOnlineUsers",Object.keys(userSocketMap))
  })
})
app.use('/api/users', (req,res)=>res.send("Server is live"));
app.use("/api/auth",UserRouter)
app.use("/api/messages",messageRouter)

const PORT=process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

