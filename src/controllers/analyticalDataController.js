const AnalyticalData = require("../models/analyticalData");
const { APIError } = require('../utils/errors');

exports.getAnalyticalData = async (req, res, next) => {
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

    //error handler
    if(result.length === 0) {
      throw new APIError('No analytical data found',404)
    }
    res.status(200).json(result);
  } catch (error) {
    next(error)  
  }
};
