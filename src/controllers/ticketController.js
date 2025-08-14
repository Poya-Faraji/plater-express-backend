import prisma from "../../prismaClient.js";
import { validate as uuidValidate } from "uuid";

export const ticketController = async (req, res) => {
  try {
    const { vehicle_id, officer_id, violation, amount } = req.body;
    

    // Validate required fields
    if (!vehicle_id || !officer_id || !violation || !amount) {
      return res.status(400).json({ error: "فیلدهای الزامی وجود ندارد" });
    }

    if (!uuidValidate(vehicle_id)) {
      return res.status(400).json({
        error: "قالب شناسه وسیله نقلیه نامعتبر است - باید یک UUID معتبر باشد",
      });
    }

    if (!uuidValidate(officer_id)) {
      return res.status(400).json({
        error: "قالب شناسه افسر نامعتبر است - باید یک UUID معتبر باشد",
      });
    }

    // Validate amount is a valid number
    if (isNaN(amount)) {
      return res.status(400).json({
        error: "مبلغ نامعتبر است - باید عدد باشد",
      });
    }

  
    const amountValue = parseFloat(amount);

    const newTicket = await prisma.ticket.create({
      data: {
        vehicleId: vehicle_id,
        officerId: officer_id,
        violation,
        amount: amountValue,
      },
    });

  
    res.status(201).json({
      message: "جریمه با موفقیت ایجاد شد",
      ticketId: newTicket.id,
    });
  } catch (error) {
    console.error("Ticket creation error:", error);

    if (error.code === "P2003") {
      return res.status(400).json({
        error: "کارت شناسایی خودرو یا افسر نامعتبر است - مدرک شناسایی پیدا نشد",
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
      error: "قالب شناسه افسر نامعتبر است - باید یک UUID معتبر باشد",
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
        message: "هیچ جزیمه ای برای افسر مورد نظر یافت نشد.",
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

export const getTicketByID = async (req, res) => {
  const { ticket_id } = req.params;

  if (!uuidValidate(ticket_id)) {
    return res.status(400).json({
      error: "قالب شناسه بلیط نامعتبر است - باید یک UUID معتبر باشد",
    });
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticket_id },
      include: {
        vehicle: {
          select: {
            first2digits: true,
            letter: true,
            last3digits: true,
            citycode: true,
            model: true,
            color: true,
            owner: {
              select: {
                fname: true,
                lname: true,
                codeMeli: true,
              },
            },
          },
        },
        officer: {
          select: {
            fname: true,
            lname: true,
            codeMeli: true,
          },
        },
        payments: {
          select: {
            paidAt: true,
            amount: true,
            method: true,
            transactionId: true,
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: "جریمه یافت نشد." });
    }

    const formattedTicket = {
      id: ticket.id,
      ticketNumber: ticket.id.substring(0, 8).toUpperCase(),
      violation: ticket.violation,
      issuedAt: ticket.issuedAt.toISOString(),
      status: ticket.status,
      amount: ticket.amount.toNumber(),
      first2digits: ticket.vehicle.first2digits,
      letter: ticket.vehicle.letter,
      last3digits: ticket.vehicle.last3digits,
      cityCode: ticket.vehicle.citycode,
      carModel: ticket.vehicle.model,
      carColor: ticket.vehicle.color,
      driverFullName: `${ticket.vehicle.owner.fname} ${ticket.vehicle.owner.lname}`,
      driverNationalId: ticket.vehicle.owner.codeMeli,
      officerFullName: `${ticket.officer.fname} ${ticket.officer.lname}`,
      officerNationalId: ticket.officer.codeMeli,
      // Payments - assuming we take the first payment if exists
      payment:
        ticket.payments.length > 0
          ? {
              paidAt: ticket.payments[0].paidAt.toISOString(),
              amount: ticket.payments[0].amount.toNumber(),
              method: ticket.payments[0].method,
              transactionId: ticket.payments[0].transactionId,
            }
          : null,
    };

    return res.status(200).json(formattedTicket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const cancelTicket = async (req, res) => {
  const { ticket_id } = req.params;

  if (!uuidValidate(ticket_id)) {
    return res.status(400).json({
      error: "فرمت شناسه قبض نامعتبر است - باید UUID معتبر باشد",
    });
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticket_id },
      select: { status: true },
    });

    if (!ticket) {
      return res.status(404).json({ error: "قبض مورد نظر یافت نشد" });
    }

    if (ticket.status !== "UNPAID") {
      return res.status(400).json({
        error: `قبض با وضعیت ${getStatusText(ticket.status)} قابل لغو نیست`,
        currentStatus: ticket.status,
        allowedStatus: "UNPAID",
      });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket_id },
      data: { status: "CANCELLED" },
    });

    return res.status(200).json({
      message: "قبض با موفقیت لغو شد",
      newStatus: updatedTicket.status,
    });
  } catch (error) {
    console.error("خطا در لغو قبض:", error);
    return res.status(500).json({ error: "خطای سرور داخلی" });
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "PAID":
      return "پرداخت شده";
    case "UNPAID":
      return "پرداخت نشده";
    case "CANCELLED":
      return "لغو شده";
    default:
      return status;
  }
};


export const payTicket = async (req, res) => {
  const { ticket_id } = req.params;

  if (!uuidValidate(ticket_id)) {
    return res.status(400).json({
      error: "فرمت شناسه قبض نامعتبر است - باید UUID معتبر باشد",
    });
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticket_id },
      select: { 
        status: true,
        amount: true
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: "قبض مورد نظر یافت نشد" });
    }

    if (ticket.status !== "UNPAID") {
      return res.status(400).json({
        error: `قبض با وضعیت ${getStatusText(ticket.status)} قابل پرداخت نیست`,
        currentStatus: ticket.status,
        allowedStatus: "UNPAID",
      });
    }

    // Start transaction
    const [updatedTicket, payment] = await prisma.$transaction([
      prisma.ticket.update({
        where: { id: ticket_id },
        data: { status: "PAID" },
      }),
      prisma.payment.create({
        data: {
          ticketId: ticket_id,
          amount: ticket.amount,
          method: "آنلاین",
          paidAt: new Date(),
        },
      })
    ]);

    return res.status(200).json({
      message: "پرداخت با موفقیت انجام شد",
      newStatus: updatedTicket.status,
      paymentId: payment.id,
      amount: payment.amount.toNumber(),
      paidAt: payment.paidAt,
    });
  } catch (error) {
    console.error("خطا در پرداخت قبض:", error);
    return res.status(500).json({ error: "خطای سرور داخلی" });
  }
};
