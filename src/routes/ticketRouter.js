import express from 'express';

import { verifyToken } from '../middleware/verifyToken.js';



const router = express.Router();



router.get("/name-here!!", verifyToken, asdasd)




export default router;