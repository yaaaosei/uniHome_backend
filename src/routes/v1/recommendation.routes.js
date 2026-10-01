const express = require('express');
const { getRecommendationsHandler } = require('../../controllers/recommendation.controller');

const router = express.Router();

router.post('/', getRecommendationsHandler);

module.exports = router;
