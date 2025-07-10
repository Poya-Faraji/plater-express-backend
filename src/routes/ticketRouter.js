import express from 'express';

import { verifyToken } from '../middleware/verifyToken.js';
import { ticketController } from '../controllers/ticketController.js';



const router = express.Router();



router.post("/create-ticket", verifyToken, ticketController)




export default router;