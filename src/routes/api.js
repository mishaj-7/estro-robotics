const express = require("express");
const router = express.Router();
const analyticalDataController = require("../controllers/analyticalDataController");
const uptimeDataController = require('../controllers/upTimeDataController');
const overallReportController = require('../controllers/overallReportController');
const auth = require('../middlewares/auth');

//apply auth middleware to all routes

router.use(auth);


/**
 * @swagger
 * /api/analytical-data:
 *   get:
 *     summary: Get analytical data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                   hourlyData:
 *                     type: array
 *                   totalCount:
 *                     type: number
 *                   totalZeros:
 *                     type: number
 *                   totalOnes:
 *                     type: number
 *                   averageRate:
 *                     type: number
 *                   busiestHour:
 *                     type: object
 *       404:
 *         description: No analytical data found
 */
router.get('/analytical-data', analyticalDataController.getAnalyticalData);

/**
 * @swagger
 * /api/uptime-data:
 *   get:
 *     summary: Get uptime data
 *     tags: [Uptime]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   state:
 *                     type: string
 *                   changedAt:
 *                     type: string
 *                   duration:
 *                     type: number
 *       404:
 *         description: No uptime data found
 */
router.get('/uptime-data',uptimeDataController.getUptimeData);

/**
 * @swagger
 * /api/overall-report:
 *   get:
 *     summary: Get overall report
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analyticalSummary:
 *                   type: object
 *                 busiestDays:
 *                   type: array
 *                 quietestDays:
 *                   type: array
 *                 uptimeSummary:
 *                   type: object
 *       404:
 *         description: Insufficient data to generate report
 */
router.get('/overall-report',overallReportController.getOverallReport);

module.exports = router;
