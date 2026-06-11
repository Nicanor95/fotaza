import 'dotenv/config';
import { Router } from 'express';
import { showLogin, showSignup, login, signup, logout } from '../controller/auth.js';

const authRouter = Router();

//Login
authRouter.get("/login", showLogin);
authRouter.post("/login", login);

//Signup
authRouter.get("/signup", showSignup);
authRouter.post("/signup", signup);

//Logout
authRouter.post("/logout", logout);

export default authRouter;