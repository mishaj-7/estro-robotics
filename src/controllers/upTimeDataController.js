const UptimeData = require("../models/uptimeData");
const { APIError } = require("../utils/errors");

exports.getUptimeData = async(req, res, next) => {
    try {
        const uptimeData = await UptimeData.find().sort({ timestamp: 1 });
        
        // error handler 
        if(uptimeData.length === 0) {
          throw new APIError('No uptime data found', 404);
        }

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
        res.status(200).json(result);

      } catch (error) {
        console.error('Error in uptime data API:', error);
        next(error)
      }
} 