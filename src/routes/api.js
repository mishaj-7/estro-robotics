const express = require("express");
const router = express.Router();
const analyticalDataController = require("../controllers/analyticalDataController");
const uptimeDataController = require('../controllers/upTimeDataController');
const overallReportController = require('../controllers/overallReportController');
const auth = require('../middlewares/auth');

//apply auth middleware to all routes

router.use(auth);


// Analytical Data API
router.get('/analytical-data', analyticalDataController.getAnalyticalData);

// Uptime Data API
router.get('/uptime-data',uptimeDataController.getUptimeData);

// Overall Report API
router.get('/overall-report',overallReportController.getOverallReport);

module.exports = router;
