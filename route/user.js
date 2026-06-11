import 'dotenv/config';
import { Router } from 'express';
import { showProfile, followUser, unfollowUser } from '../controller/user.js';
import { authMiddleware } from '../middleware/auth.js';

const userRouter = Router();

userRouter.get("/:user_id", showProfile);
userRouter.post("/:user_id", authMiddleware, followUser);
userRouter.post("/:user_id/unfollow", authMiddleware, unfollowUser);

export default userRouter;