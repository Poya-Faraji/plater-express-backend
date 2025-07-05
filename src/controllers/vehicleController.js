import prisma from "../../prismaClient.js";
import { validate as uuidValidate } from "uuid";

export const vehicleController = async (req, res) => {
  try {
    const {
      first2digits,
      letter,
      last3digits,
      citycode,
      model,
      color,
      year,
      owner_id,
    } = req.body;

    // Validate required fields
    if (
      !first2digits ||
      !letter ||
      !last3digits ||
      !citycode ||
      !model ||
      !color ||
      !year ||
      !owner_id
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (first2digits.length !== 2) {
      return res
        .status(400)
        .json({ error: "First2digits must have length of 2." });
    }

    if (last3digits.length !== 3) {
      return res
        .status(400)
        .json({ error: "last3digits must have length of3." });
    }

    if (letter.length !== 1) {
      return res.status(400).json({ error: "Letter must be 1 character." });
    }

    if (citycode.length !== 2) {
      return res.status(400).json({ error: "City code must be 2 digits." });
    }

    // Check if vehcile already exists
    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        first2digits,
        letter,
        last3digits,
        citycode,
      },
    });

    if (existingVehicle) {
      return res.status(409).json({ error: "Vehicle plate already exsists in database." });
      
    }

    if (!uuidValidate(owner_id)) {
      return res.status(400).json({
        error: "Invalid owner_id format - must be a valid UUID",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        id: owner_id,
      },
    });

    if (!existingUser) {
      return res
        .status(404)
        .json({ error: "Vehicle must be signed to existing user." });
    }

    // Create Vehicle
    const newVehicle = await prisma.vehicle.create({
      data: {
        first2digits,
        letter,
        last3digits,
        citycode,
        model,
        color,
        year: parseInt(year),
        owner: {
          connect: {
            id: owner_id,
          },
        },
      },
    });

    // Return response without password hash
    res.status(201).json({ vehicle: newVehicle });
  } catch (error) {
    console.error("Vehicle creation error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};
