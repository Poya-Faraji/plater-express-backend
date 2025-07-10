import express from "express";

import { verifyToken } from "../middleware/verifyToken.js";
import { deleteVehicle, getVehicleDetails, vehicleController } from "../controllers/vehicleController.js";

const router = express.Router();

router.post("/add-vehicle", verifyToken, vehicleController);


router.get("/vehicles/:id", verifyToken, getVehicleDetails);


router.delete("/vehicles/delete/:id", verifyToken, deleteVehicle);



export default router;
