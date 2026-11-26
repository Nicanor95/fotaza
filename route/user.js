import 'dotenv/config';
import { Router } from 'express';
import { showProfile, followUser, unfollowUser, followedPosts, showFavourites, showCollections, showAddToCollectionForm, addToCollection, createCollection, showCollection, removeFromCollection, deleteCollection } from '../controller/user.js';
import { authMiddleware } from '../middleware/auth.js';

const userRouter = Router();

userRouter.get("/followed", authMiddleware, followedPosts);
userRouter.get("/:user_id/favoritos", authMiddleware, showFavourites);
userRouter.get("/:user_id/colecciones", authMiddleware, showCollections);
userRouter.post("/:user_id/colecciones/:col_id/eliminar", authMiddleware, deleteCollection);
userRouter.get("/:user_id/coleccion/agregar/:image_id", authMiddleware, showAddToCollectionForm);
userRouter.post("/:user_id/colecciones", authMiddleware, createCollection);
userRouter.post("/:user_id/colecciones/:col_id/imagenes/:image_id", authMiddleware, addToCollection);
userRouter.post("/:user_id/colecciones/:col_id/imagenes/:image_id/eliminar", authMiddleware, removeFromCollection);
userRouter.get("/:user_id/colecciones/:col_id", authMiddleware, showCollection);
userRouter.get("/:user_id", showProfile);
userRouter.post("/:user_id", authMiddleware, followUser);
userRouter.post("/:user_id/unfollow", authMiddleware, unfollowUser);

export default userRouter;