import 'dotenv/config';
import { Router } from 'express';
import { userMiddleware } from '../middleware/auth.js';
import { searchByTags } from '../controller/search.js';

const searchRouter = Router();

searchRouter.post('/bytag', searchByTags);

export default searchRouter;