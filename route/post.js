
import 'dotenv/config';
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { showAlbum, showNewPost, newPost, storage, upload } from '../controller/post.js';

const postRouter = Router();

// Show publication
postRouter.get("/album/:album_id", showAlbum);

// New publication
postRouter.get("/newpost", authMiddleware, showNewPost);
postRouter.post("/newpost", authMiddleware, upload.array('images', 6), newPost);

export default postRouter;