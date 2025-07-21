import prisma from "../../prismaClient.js";

export const userControler = async (req, res) => {
  const userID = req.user.userId;

  try {
    const user = await prisma.user.findFirst({
      where: { id: userID },
      select: {
        id: true,
        username: true,
        fname: true,
        lname: true,
        codeMeli: true,
        userType: true,
        _count: {
          select: { ownedVehicles: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }

    const responseData = {
      id: user.id,
      username: user.username,
      fname: user.fname,
      lname: user.lname,
      codeMeli: user.codeMeli,
      userType: user.userType,
    };

    if (user.userType === "OWNER") {
      if (user._count.ownedVehicles > 0) {
        // Fetch vehicles only if count > 0
        const vehicles = await prisma.vehicle.findMany({
          where: { ownerId: userID },
          select: {
            id: true,
            first2digits: true,
            letter: true,
            last3digits: true,
            citycode: true,
            model: true,
            color: true,
            year: true,
          },
        });
        responseData.vehicles = vehicles;
      }
    }

    res.json(responseData);
  } catch (error) {
    console.log("Error fetching user: ", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};
