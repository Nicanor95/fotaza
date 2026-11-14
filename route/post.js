
import 'dotenv/config';
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { showAlbum, showNewPost, newPost, storage, upload } from '../controller/post.js';
import { createComment } from '../controller/comment.js';
import { newValoration } from '../controller/valoracion.js';
import { addFavourite, removeFavourite } from '../controller/user.js';

const postRouter = Router();

// Show publication
postRouter.get("/album/:album_id{/:image_id}", showAlbum);

// Create a comment for an image
postRouter.post('/album/:album_id/:image_id', authMiddleware, createComment);

// Valorate an image
postRouter.post('/album/:album_id/:image_id/valorate', authMiddleware, newValoration);

// Add image to favourites
postRouter.post('/album/:album_id/:image_id/favourite', authMiddleware, addFavourite);

// Remove image from favourites
postRouter.post('/album/:album_id/:image_id/unfavourite', authMiddleware, removeFavourite);

// New publication
postRouter.get("/newpost", authMiddleware, showNewPost);
postRouter.post("/newpost", authMiddleware, upload.array('images', 6), newPost);

export default postRouter;