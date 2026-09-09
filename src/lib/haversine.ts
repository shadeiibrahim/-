// University of Sinai Main Gate Coordinates (Arish / North Sinai)
// Can be customized via env: UNIVERSITY_LAT, UNIVERSITY_LNG
export const SINAI_UNIVERSITY_COORDS = {
  lat: 31.1304,
  lng: 33.8032,
};

/**
 * Calculates distance in kilometers between two coordinates using the Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number = SINAI_UNIVERSITY_COORDS.lat,
  lon2: number = SINAI_UNIVERSITY_COORDS.lng
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // rounded to 1 decimal place
}

/**
 * Formats distance info: km, walking minutes (approx 5 km/h), car minutes (approx 30 km/h)
 */
export function formatUniversityDistance(lat: number, lng: number): {
  km: number;
  walkMin: number;
  driveMin: number;
  formattedText: string;
} {
  const km = calculateHaversineDistance(lat, lng);
  // Average walking speed ~ 5 km/h -> 1 km is 12 mins
  const walkMin = Math.max(1, Math.round(km * 12));
  // Average city driving speed ~ 30 km/h -> 1 km is 2 mins
  const driveMin = Math.max(1, Math.round(km * 2));

  return {
    km,
    walkMin,
    driveMin,
    formattedText: `📍 ${km} كم من الجامعة | 🚶 ${walkMin} دقيقة مشي | 🚗 ${driveMin} دقيقة بالسيارة`,
  };
}
