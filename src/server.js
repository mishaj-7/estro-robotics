require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const apiRoutes = require("./routes/api");

const app = express();

// parse json to js
app.use(express.json());

// mongodb connet
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

// api routes here
app.use("/api", apiRoutes);

// test route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to estro api" });
});

// server port listen
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
