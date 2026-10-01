const { getRecommendations } = require('../services/RecommendationEngineService');

// @desc    Get recommendations
// @route   POST /api/v1/recommendations
// @access  Public 
const getRecommendationsHandler = async (req, res, next) => {
  try {
    const { preferenceProfileId, preferenceProfile, topK = 10 } = req.body;
    
    if (!preferenceProfileId && !preferenceProfile) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Must provide preferenceProfileId or preferenceProfile object.' });
    }

    const input = preferenceProfileId || preferenceProfile;
    const recommendations = await getRecommendations(input, parseInt(topK, 10));

    return res.status(200).json({
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendationsHandler
};
