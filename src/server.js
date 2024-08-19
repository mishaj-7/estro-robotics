require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const apiRoutes = require("./routes/api");
const {  APIError } = require('./utils/errors');
const authRoutes = require('./routes/route.auth')
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');

const app = express();

// parse json to js
app.use(express.json());

// docmentation using swagger npm read documentatin
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// mongodb connet
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

// authenticater rote before go to api route
app.use('/auth', authRoutes)

// api routes here
app.use("/api", apiRoutes);

// test route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to estro api" });
});

// 404 error handler
app.use((req, res, next) => {
  next(new APIError('Not Found', 404));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof APIError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        status: err.statusCode
      }
    });
  } else {
    res.status(500).json({
      error: {
        message: 'Internal Server Error',
        status: 500
      }
    });
  }
});

// server port listen
if(require.main === module ) {
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

}

module.exports = app;