import express from 'express';
import { signup,login,updateProfile } from '../controller/UserController.js';
import { checkAuth } from '../middleware/auth.js';
import { protectRoute } from '../middleware/auth.js';
const UserRouter = express.Router();

UserRouter.post('/signup', signup);
UserRouter.post('/login', login);
UserRouter.put('/profile', protectRoute, updateProfile);
UserRouter.get('/check', protectRoute, checkAuth);

export default UserRouter;
