const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();


const app = express();
console.log("CLIENT_URL =", process.env.CLIENT_URL);
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Import routes
const apiRoutes =require("./api/routes/index.js");

// Mount API routes
app.use("/api", apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something broke!';
  res.status(statusCode).json({ message });
});


app.get("/", (req, res) => {
  res.json({ message: "Backend running 🟢" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
