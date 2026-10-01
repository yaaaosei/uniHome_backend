const filterByHardConstraints = async (HostelModel, preferenceProfile) => {
  const query = {};

  if (preferenceProfile.maxBudget) {
    query.price = { $lte: preferenceProfile.maxBudget };
  }
  
  if (preferenceProfile.roomType && preferenceProfile.roomType !== 'any') {
    query.roomType = preferenceProfile.roomType;
  }
  
  // Note: Soft amenity matching is handled during computeWeightedScores.
  // We do NOT hard filter amenities here so candidate hostels with partial matches remain eligible.
  
  if (preferenceProfile.genderPolicy && preferenceProfile.genderPolicy !== 'any') {
    if (preferenceProfile.genderPolicy === 'male-only') {
      query.genderPolicy = { $in: ['male-only', 'mixed'] };
    } else if (preferenceProfile.genderPolicy === 'female-only') {
      query.genderPolicy = { $in: ['female-only', 'mixed'] };
    } else {
      query.genderPolicy = preferenceProfile.genderPolicy;
    }
  }

  return await HostelModel.find(query).lean();
};

const haversineDistance = (coord1, coord2) => {
  const toRad = x => (x * Math.PI) / 180;
  const lon1 = coord1[0];
  const lat1 = coord1[1];
  const lon2 = coord2[0];
  const lat2 = coord2[1];

  const R = 6371; // Earth's mean radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const computeProximityScores = (candidateHostels, campusReferencePoint) => {
  if (!candidateHostels || candidateHostels.length === 0) return {};

  const distances = candidateHostels.map(h => {
    let d = Infinity;
    if (h.coordinates && h.coordinates.coordinates && h.coordinates.coordinates.length === 2) {
      d = haversineDistance(h.coordinates.coordinates, campusReferencePoint);
    }
    return { hostelId: h._id.toString(), distance: d };
  });

  const validDistances = distances.filter(d => d.distance !== Infinity).map(d => d.distance);
  let minD = 0, maxD = 0;
  if (validDistances.length > 0) {
    minD = Math.min(...validDistances);
    maxD = Math.max(...validDistances);
  }

  const scores = {};
  distances.forEach(d => {
    if (d.distance === Infinity) {
      scores[d.hostelId] = 0;
    } else if (maxD === minD) {
      scores[d.hostelId] = 1;
    } else {
      scores[d.hostelId] = (maxD - d.distance) / (maxD - minD);
    }
  });

  return scores;
};

const computeWeightedScores = (candidateHostels, preferenceProfile, proximityScores) => {
  if (!candidateHostels || candidateHostels.length === 0) return [];
  
  let minPrice = Infinity, maxPrice = -Infinity;
  let minSec = Infinity, maxSec = -Infinity;
  let minSan = Infinity, maxSan = -Infinity;
  let minInt = Infinity, maxInt = -Infinity;

  candidateHostels.forEach(h => {
    if (h.price < minPrice) minPrice = h.price;
    if (h.price > maxPrice) maxPrice = h.price;
    const sec = h.security || 0;
    if (sec < minSec) minSec = sec;
    if (sec > maxSec) maxSec = sec;
    const san = h.sanitation || 0;
    if (san < minSan) minSan = san;
    if (san > maxSan) maxSan = san;
    const int = h.internet || 0;
    if (int < minInt) minInt = int;
    if (int > maxInt) maxInt = int;
  });

  const normalize = (val, min, max, invert = false) => {
    if (min === max) return 1;
    let norm = (val - min) / (max - min);
    return invert ? 1 - norm : norm;
  };

  const w = preferenceProfile.weights || {
    price: 0.3,
    proximity: 0.2,
    security: 0.1,
    sanitation: 0.1,
    internet: 0.1,
    amenityMatch: 0.2
  };

  const scoredHostels = candidateHostels.map(h => {
    const priceScore = normalize(h.price, minPrice, maxPrice, true);
    const secScore = normalize(h.security || 0, minSec, maxSec);
    const sanScore = normalize(h.sanitation || 0, minSan, maxSan);
    const intScore = normalize(h.internet || 0, minInt, maxInt);
    
    const proxScore = proximityScores[h._id.toString()] !== undefined ? proximityScores[h._id.toString()] : 0;

    let amenityMatch = 0;
    const prefAm = preferenceProfile.requiredAmenities || [];
    if (prefAm.length > 0) {
      const matchCount = prefAm.filter(a => h.amenities && h.amenities.includes(a)).length;
      amenityMatch = matchCount / prefAm.length;
    } else {
      amenityMatch = 1;
    }

    const totalScore = 
      ((w.price || 0) * priceScore) +
      ((w.proximity || 0) * proxScore) +
      ((w.security || 0) * secScore) +
      ((w.sanitation || 0) * sanScore) +
      ((w.internet || 0) * intScore) +
      ((w.amenityMatch || 0) * amenityMatch);

    return {
      ...h,
      recommendationScore: totalScore
    };
  });

  return scoredHostels.sort((a, b) => b.recommendationScore - a.recommendationScore);
};

const getRecommendations = async (preferenceProfileId, topK = 10) => {
  const PreferenceProfile = require('../models/PreferenceProfile');
  const Hostel = require('../models/Hostel');
  
  let profile = typeof preferenceProfileId === 'object' ? preferenceProfileId : null;
  if (!profile) {
    profile = await PreferenceProfile.findById(preferenceProfileId).lean();
    if (!profile) throw new Error('Preference profile not found');
  }

  const candidates = await filterByHardConstraints(Hostel, profile);
  
  const campusReferencePoint = [ -0.186964, 5.650846 ]; // Default reference point
  const proximityScores = computeProximityScores(candidates, campusReferencePoint);
  const ranked = computeWeightedScores(candidates, profile, proximityScores);
  
  return ranked.slice(0, topK);
};

module.exports = {
  filterByHardConstraints,
  haversineDistance,
  computeProximityScores,
  computeWeightedScores,
  getRecommendations
};