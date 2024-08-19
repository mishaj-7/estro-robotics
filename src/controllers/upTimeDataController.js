const UptimeData = require("../models/uptimeData");

exports.getUptimeData = async(req, res) => {
    try {
        const uptimeData = await UptimeData.find().sort({ timestamp: 1 });
        
        let result = [];
        let lastState = null;
        let lastStateTime = null;
    
        for (let i = 0; i < uptimeData.length; i++) {
          const currentData = uptimeData[i];
          
          if (lastState !== null) {
            result.push({
              state: lastState,
              changedAt: lastStateTime,
              duration: currentData.timestamp - lastStateTime
            });
          }
    
          lastState = currentData.status;
          lastStateTime = currentData.timestamp;
        }
    
        // Add the last state if it exists
        if (lastState !== null) {
          result.push({
            state: lastState,
            changedAt: lastStateTime,
            duration: new Date() - lastStateTime
          });
        }
    
        res.json(result);
      } catch (error) {
        console.error('Error in uptime data API:', error);
        res.status(500).json({ error: 'An error occurred while fetching uptime data' });
      }
} 