import express from 'express';

import { verifyToken } from '../middleware/verifyToken.js';
import { getTicketsByOfficer, ticketController } from '../controllers/ticketController.js';



const router = express.Router();



router.post("/create-ticket", verifyToken, ticketController)


router.get('/tickets/officer/:officer_id',verifyToken, getTicketsByOfficer)



export default router;