const { haversineDistance, computeWeightedScores } = require('../src/services/RecommendationEngineService');

describe('RecommendationEngineService', () => {
  describe('haversineDistance', () => {
    it('should correctly calculate distance between New York and London', () => {
      // New York: [ -74.006, 40.7128 ]
      // London: [ -0.1278, 51.5074 ]
      // Known distance is approx 5570 km
      const ny = [-74.006, 40.7128];
      const lon = [-0.1278, 51.5074];
      const dist = haversineDistance(ny, lon);
      
      // Allow for a small margin of error (e.g. 50km) due to Earth's imperfect spherical shape
      expect(dist).toBeGreaterThan(5500);
      expect(dist).toBeLessThan(5600);
    });

    it('should correctly calculate distance between Legon and Accra Central', () => {
      // Legon: [ -0.186964, 5.650846 ]
      // Accra Central (Makola): [ -0.205744, 5.543584 ]
      // Known distance is approx 12-15 km
      const legon = [-0.186964, 5.650846];
      const accra = [-0.205744, 5.543584];
      const dist = haversineDistance(legon, accra);
      
      expect(dist).toBeGreaterThan(11);
      expect(dist).toBeLessThan(13);
    });
  });

  describe('computeWeightedScores', () => {
    it('should compute weighted scores correctly for 3 hostels', () => {
      // Setup candidate hostels
      // minPrice=500, maxPrice=1500
      // minSec=2, maxSec=5
      // minSan=3, maxSan=5
      // minInt=1, maxInt=4
      
      const candidates = [
        { _id: 'h1', price: 500, security: 2, sanitation: 3, internet: 1, amenities: ['Wi-Fi'] }, // cheapest, lowest scores
        { _id: 'h2', price: 1000, security: 4, sanitation: 4, internet: 3, amenities: ['Wi-Fi', 'AC'] }, // medium
        { _id: 'h3', price: 1500, security: 5, sanitation: 5, internet: 4, amenities: ['Wi-Fi', 'AC', 'Pool'] } // expensive, highest scores
      ];

      // Proximity scores pre-calculated (h1: 1, h2: 0.5, h3: 0)
      const proximityScores = {
        h1: 1,
        h2: 0.5,
        h3: 0
      };

      // Profile: required amenities = ['Wi-Fi', 'AC'] (length 2)
      // Weights: price=0.3, proximity=0.2, security=0.1, sanitation=0.1, internet=0.1, amenityMatch=0.2
      const profile = {
        requiredAmenities: ['Wi-Fi', 'AC'],
        weights: {
          price: 0.3,
          proximity: 0.2,
          security: 0.1,
          sanitation: 0.1,
          internet: 0.1,
          amenityMatch: 0.2
        }
      };

      /**
       * Hand Calculation:
       * 
       * H1:
       * - price: (500-500)/(1500-500) = 0 => invert => 1.0 * 0.3 = 0.3
       * - proximity: 1.0 * 0.2 = 0.2
       * - security: (2-2)/(5-2) = 0 => 0.0 * 0.1 = 0
       * - sanitation: (3-3)/(5-3) = 0 => 0.0 * 0.1 = 0
       * - internet: (1-1)/(4-1) = 0 => 0.0 * 0.1 = 0
       * - amenityMatch: 1/2 = 0.5 => 0.5 * 0.2 = 0.1
       * Total H1 = 0.3 + 0.2 + 0 + 0 + 0 + 0.1 = 0.6
       * 
       * H2:
       * - price: (1000-500)/(1500-500) = 0.5 => invert => 0.5 * 0.3 = 0.15
       * - proximity: 0.5 * 0.2 = 0.1
       * - security: (4-2)/(5-2) = 2/3 = 0.666... => 0.666 * 0.1 = 0.0666
       * - sanitation: (4-3)/(5-3) = 0.5 => 0.5 * 0.1 = 0.05
       * - internet: (3-1)/(4-1) = 2/3 = 0.666... => 0.666 * 0.1 = 0.0666
       * - amenityMatch: 2/2 = 1.0 => 1.0 * 0.2 = 0.2
       * Total H2 = 0.15 + 0.1 + 0.0666 + 0.05 + 0.0666 + 0.2 = 0.6333
       * 
       * H3:
       * - price: (1500-500)/(1500-500) = 1.0 => invert => 0.0 * 0.3 = 0
       * - proximity: 0.0 * 0.2 = 0
       * - security: (5-2)/(5-2) = 1.0 => 1.0 * 0.1 = 0.1
       * - sanitation: (5-3)/(5-3) = 1.0 => 1.0 * 0.1 = 0.1
       * - internet: (4-1)/(4-1) = 1.0 => 1.0 * 0.1 = 0.1
       * - amenityMatch: 2/2 = 1.0 => 1.0 * 0.2 = 0.2
       * Total H3 = 0 + 0 + 0.1 + 0.1 + 0.1 + 0.2 = 0.5
       */
      
      const ranked = computeWeightedScores(candidates, profile, proximityScores);
      
      expect(ranked.length).toBe(3);
      
      // H2 should be 1st (0.6333)
      expect(ranked[0]._id).toBe('h2');
      expect(ranked[0].recommendationScore).toBeCloseTo(0.6333, 2);
      
      // H1 should be 2nd (0.60)
      expect(ranked[1]._id).toBe('h1');
      expect(ranked[1].recommendationScore).toBeCloseTo(0.60, 2);
      
      // H3 should be 3rd (0.50)
      expect(ranked[2]._id).toBe('h3');
      expect(ranked[2].recommendationScore).toBeCloseTo(0.50, 2);
    });
  });
});
