const mongoose = require("mongoose");

const uptimeDataSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["connected", "disconnected"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UptimeData", uptimeDataSchema);
