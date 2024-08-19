const UptimeData = require("../models/uptimeData");
const AnalyticalData = require("../models/analyticalData");


exports.getOverallReport = async (req, res) => {
    try {
        // Calculate total and average analytical data
        const analyticalSummary = await AnalyticalData.aggregate([
          {
            $group: {
              _id: null,
              totalData: { $sum: 1 },
              totalOnes: { $sum: { $cond: [{ $eq: ["$data", 1] }, 1, 0] } },
              totalZeros: { $sum: { $cond: [{ $eq: ["$data", 0] }, 1, 0] } }
            }
          },
          {
            $project: {
              _id: 0,
              totalData: 1,
              totalOnes: 1,
              totalZeros: 1,
              averageData: { $divide: ["$totalData", 60] } // consider 60 days
            }
          }
        ]);
    
        // Find busiest and quietest days
        const dailyData = await AnalyticalData.aggregate([
          {
            $group: {
              _id: {
                year: { $year: "$timestamp" },
                month: { $month: "$timestamp" },
                day: { $dayOfMonth: "$timestamp" }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          {
            $project: {
              _id: 0,
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: "$_id.day"
                }
              },
              count: 1
            }
          }
        ]);
    
        const busiestDays = dailyData.slice(0, 3);
        const quietestDays = dailyData.slice(-3).reverse();
    
        // Calculate total uptime and downtime
        const uptimeSummary = await UptimeData.aggregate([
          { $sort: { timestamp: 1 } },
          {
            $group: {
              _id: null,
              records: { $push: { timestamp: "$timestamp", status: "$status" } }
            }
          }
        ]).exec();
        
        const records = uptimeSummary[0]?.records || [];
        let totalUptime = 0;
        let totalDowntime = 0;
        
        for (let i = 0; i < records.length - 1; i++) {
          const current = records[i];
          const next = records[i + 1];
          
          const duration = next.timestamp - current.timestamp;
          
          if (current.status === 'connected') {
            totalUptime += duration;
          } else if (current.status === 'disconnected') {
            totalDowntime += duration;
          }
        }
    
        res.json({
          analyticalSummary: analyticalSummary[0],
          busiestDays,
          quietestDays,
          uptimeSummary
        });
    
      } catch (error) {
        console.error('Error in overall report API:', error);
        res.status(500).json({ error: 'An error occurred while generating the overall report' });
      }
}