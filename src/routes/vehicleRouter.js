import express from "express";

import { verifyToken } from "../middleware/verifyToken.js";
import { deleteVehicle, getVehicleDetails, vehicleController } from "../controllers/vehicleController.js";
import { getVehicleIdByPlate } from "../controllers/verifyPlateController.js";

const router = express.Router();

router.post("/add-vehicle", verifyToken, vehicleController);


router.get("/vehicles/:id", verifyToken, getVehicleDetails);


router.delete("/vehicles/delete/:id", verifyToken, deleteVehicle);


router.post('/vehicle/verify-plate', verifyToken, getVehicleIdByPlate)


export default router;
