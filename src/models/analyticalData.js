const mongoose = require("mongoose");

const analyticalDataSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true },
    data: { type: Number, required: true, enum: [0, 1] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AnalyticalData", analyticalDataSchema);
