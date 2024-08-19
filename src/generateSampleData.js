require('dotenv').config();
const mongoose = require('mongoose');
const AnalyticalData = require('./models/analyticalData');
const UptimeData = require('./models/uptimeData');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const twoMonthsAgo = new Date();
twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

async function generateData() {
  const analyticalData = [];
  const uptimeData = [];
  let currentDate = new Date(twoMonthsAgo);
  let isConnected = true;

  while (currentDate <= new Date()) {
    // Generate 12-14 hours of data per day
    const workHours = 12 + Math.floor(Math.random() * 3);
    const startHour = 8 + Math.floor(Math.random() * 2); // Start between 8-9 AM

    for (let hour = startHour; hour < startHour + workHours; hour++) {
      currentDate.setHours(hour, 0, 0, 0);

      // Generate analytical data (1-60 triggers per hour)
      const triggers = 1 + Math.floor(Math.random() * 60);
      for (let i = 0; i < triggers; i++) {
        const minutes = Math.floor(Math.random() * 60);
        const seconds = Math.floor(Math.random() * 60);
        currentDate.setMinutes(minutes, seconds, 0);
        analyticalData.push({
          timestamp: new Date(currentDate),
          data: Math.random() < 0.5 ? 0 : 1
        });
      }

      // Generate uptime data (1-3 status changes per hour)
      const statusChanges = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < statusChanges; i++) {
        isConnected = !isConnected;
        uptimeData.push({
          timestamp: new Date(currentDate),
          status: isConnected ? 'connected' : 'disconnected'
        });
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(0, 0, 0, 0);
  }

  // Insert data into MongoDB
  await AnalyticalData.insertMany(analyticalData);
  await UptimeData.insertMany(uptimeData);

  console.log(`Generated ${analyticalData.length} analytical data points`);
  console.log(`Generated ${uptimeData.length} uptime data points`);

  mongoose.disconnect();
}

generateData().catch(console.error);