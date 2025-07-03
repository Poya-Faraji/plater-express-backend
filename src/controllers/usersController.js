import prisma from "../../prismaClient.js";

export const userControler = async (req, res) => {
  const userID = req.user.userId;

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userID,
      },
      select: {
        username: true,
        fname: true,
        lname: true,
        codeMeli: true,
        userType: true,
      },
    });

    res.json(user);
    console.log(user);
  } catch (error) {
    console.log("Error fetching user: ", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
