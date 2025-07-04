import express from "express";

import { verifyToken } from "../middleware/verifyToken.js";
import { vehicleController } from "../controllers/vehicleController.js";

const router = express.Router();

router.post("/add-vehicle", verifyToken, vehicleController);

export default router;
