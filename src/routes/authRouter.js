import express from 'express';
import { register, login } from '../controllers/authController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { jwtController } from '../controllers/verifyJWTController.js';


const router = express.Router();

// POST /auth/register
router.post('/register', register);

// POST /auth/login
router.post('/login', login);

//POST /auth/verify-token
router.get("/verify-token", verifyToken, jwtController)


//
router.get("/verify-token", verifyToken, jwtController)

export default router;