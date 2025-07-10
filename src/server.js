import express from "express";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import vehicleRouter from "./routes/vehicleRouter.js";

import cors from "cors";
const app = express();

const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRouter);

app.use("/api", userRouter);

app.use("/api", vehicleRouter);


// api.use("/api, ticketRouter")

app.listen(port, () => {
  console.log(`Application is listening on port ${port}`);
});
