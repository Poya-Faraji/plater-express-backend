import prisma from "../../prismaClient.js";

export const getVehicleIdByPlate = async (req, res) => {
  try {
    const { first2digits, letter, last3digits, citycode } = req.body;

    if (!first2digits || !letter || !last3digits || !citycode) {
      return res.status(400).json({
        error: "All plate components are required: first2digits, letter, last3digits, citycode"
      });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: {
        unique_plate_parts: {
          first2digits,
          letter,
          last3digits,
          citycode
        }
      },
      select: {
        id: true
      }
    });

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    res.json({ vehicleId: vehicle.id });
  } catch (error) {
    console.error("Error fetching vehicle by plate:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};