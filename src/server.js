import express from "express";

const app = express();

const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

app.listen(port, (req, res) => {
  console.log(`Application is listening on port ${port}`);
});
