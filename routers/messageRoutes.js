import express from 'express'
import { getUsersForSideBar, markMessageAsSeen } from '../controller/MessageController.js';
import { getMessage,sendMessage} from '../controller/MessageController.js';
import { protectRoute } from '../middleware/auth.js';
import { deleteChat } from '../controller/MessageController.js';

const messageRouter=express.Router();

messageRouter.get('/users',protectRoute,getUsersForSideBar)
messageRouter.get('/messages/:id',protectRoute,getMessage);
messageRouter.put('/mark/:id',protectRoute,markMessageAsSeen);
messageRouter.post('/send/:id',protectRoute,sendMessage);
messageRouter.delete('/deleteChat/:id',protectRoute,deleteChat)

export default messageRouter;
