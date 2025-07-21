import express from "express";

import { verifyToken } from "../middleware/verifyToken.js";
import { userControler } from "../controllers/usersController.js";

const router = express.Router();

router.get("/users", verifyToken, userControler);

export default router;
