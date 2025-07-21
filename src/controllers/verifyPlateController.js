import prisma from "../../prismaClient.js";

export const getVehicleIdByPlate = async (req, res) => {
  try {
    const { first2digits, letter, last3digits, citycode } = req.body;

    if (!first2digits || !letter || !last3digits || !citycode) {
      return res.status(400).json({
        error: "تمام اجزای پلاک الزامی است: دو رقم اول، حرف اول، سه رقم آخر، کد شهر"
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
      return res.status(404).json({ error: "خودرو مورد نظر ثبت نشده است" });
    }

    res.json({ vehicleId: vehicle.id });
  } catch (error) {
    console.error("خطا در دریافت خودرو بر اساس پلاک:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};