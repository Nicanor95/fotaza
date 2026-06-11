
import 'dotenv/config';
import { Router } from 'express';
import { authMiddleware, userMiddleware } from '../middleware/auth.js';
import { showAlbum, showNewPost, newPost, storage, upload } from '../controller/post.js';
import { createComment } from '../controller/comment.js';

const postRouter = Router();

// Show publication
postRouter.get("/album/:album_id{/:image_id}", showAlbum);

// Create a comment for an image
postRouter.post('/album/:album_id/:image_id', authMiddleware, createComment);

// New publication
postRouter.get("/newpost", authMiddleware, showNewPost);
postRouter.post("/newpost", authMiddleware, upload.array('images', 6), newPost);

export default postRouter;