import prisma from "../../prismaClient.js";
import { validate as uuidValidate } from "uuid";

export const ticketController = async (req, res) => {
  try {
    const { vehicle_id, officer_id, violation, amount } = req.body;

    // Validate required fields
    if (!vehicle_id || !officer_id || !violation || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!uuidValidate(vehicle_id)) {
      return res.status(400).json({
        error: "Invalid vehicle ID format - must be a valid UUID",
      });
    }

    if (!uuidValidate(officer_id)) {
      return res.status(400).json({
        error: "Invalid officer ID format - must be a valid UUID",
      });
    }

    // Validate amount is a valid number
    if (isNaN(amount)) {
      return res.status(400).json({
        error: "Invalid amount - must be a number",
      });
    }

    // Convert amount to Decimal type
    const amountValue = parseFloat(amount);

    const newTicket = await prisma.ticket.create({
      data: {
        vehicleId: vehicle_id,
        officerId: officer_id,
        violation,
        amount: amountValue,
      },
    });

    // Return successful response
    res.status(201).json({
      message: "Ticket created successfully",
      ticketId: newTicket.id,
    });
  } catch (error) {
    console.error("Ticket creation error:", error);

    // Handle specific Prisma errors
    if (error.code === "P2003") {
      return res.status(400).json({
        error: "Invalid vehicle or officer ID - reference not found",
      });
    }

    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

export const getTicketsByOfficer = async (req, res) => {
  const { officer_id } = req.params;

  if (!uuidValidate(officer_id)) {
    return res.status(400).json({
      error: "Invalid officer ID format - must be a valid UUID",
    });
  }

  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        officerId: officer_id,
      },
      include: {
        vehicle: {
          select: {
            model: true,
            first2digits: true,
            letter: true,
            last3digits: true,
            citycode: true,
          },
        },
      },
      orderBy: {
        issuedAt: "desc",
      },
    });

    if (tickets.length === 0) {
      return res.status(404).json({
        message: "No tickets found for this officer",
        officer_id,
      });
    }

    // Format the response with license plate
    const formattedTickets = tickets.map((ticket) => ({
      ...ticket,
      vehicle: {
        ...ticket.vehicle,
        licensePlate: `${ticket.vehicle.first2digits}${ticket.vehicle.letter}${ticket.vehicle.last3digits}${ticket.vehicle.citycode}`,
      },
    }));

    res.json({
      officer_id,
      count: formattedTickets.length,
      tickets: formattedTickets,
    });
  } catch (error) {
    console.error("Prisma error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};
