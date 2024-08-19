const AnalyticalData = require("../models/analyticalData");

exports.getAnalyticalData = async (req, res) => {
  try {
    const result = await AnalyticalData.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
            hour: { $hour: "$timestamp" },
          },
          count: { $sum: 1 },
          zeros: { $sum: { $cond: [{ $eq: ["$data", 0] }, 1, 0] } },
          ones: { $sum: { $cond: [{ $eq: ["$data", 1] }, 1, 0] } },
        },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
          },
          hourlyData: {
            $push: {
              hour: "$_id.hour",
              count: "$count",
              zeros: "$zeros",
              ones: "$ones",
            },
          },
          totalCount: { $sum: "$count" },
          totalZeros: { $sum: "$zeros" },
          totalOnes: { $sum: "$ones" },
        },
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          hourlyData: 1,
          totalCount: 1,
          totalZeros: 1,
          totalOnes: 1,
          averageRate: { $divide: ["$totalCount", 24] },
          busiestHour: {
            $reduce: {
              input: "$hourlyData",
              initialValue: { hour: -1, count: 0 },
              in: {
                $cond: [
                  { $gt: ["$$this.count", "$$value.count"] },
                  { hour: "$$this.hour", count: "$$this.count" },
                  "$$value",
                ],
              },
            },
          },
        },
      },
      { $sort: { date: 1 } },
    ]);

    res.json(result);
  } catch (error) {
    console.error("Error in analytical data API:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching analytical data" });
  }
};
