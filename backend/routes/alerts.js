const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getAlerts, markAlertRead } = require('../controllers/alertController');

router.get('/', auth, getAlerts);
router.patch("/:alertId/read", auth, markAlertRead);

module.exports = router;
