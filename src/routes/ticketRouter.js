import express from 'express';

import { verifyToken } from '../middleware/verifyToken.js';
import { cancelTicket, getTicketByID, getTicketsByOfficer, ticketController } from '../controllers/ticketController.js';



const router = express.Router();



router.post("/create-ticket", verifyToken, ticketController)


router.get('/tickets/officer/:officer_id',verifyToken, getTicketsByOfficer)


router.get('/ticket/:ticket_id', verifyToken, getTicketByID)


router.put('/ticket/:ticket_id/cancel', verifyToken, cancelTicket)


export default router;