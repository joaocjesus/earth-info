import { Vector3 } from 'three';

const DEG = Math.PI / 180;
export const EARTH_RADIUS = 1;

/**
 * Convert (lat, lon) in degrees to a 3D point on a sphere.
 * Convention: Greenwich (lon=0, lat=0) sits at +X with default
 * Three.js SphereGeometry UV mapping.
 */
export function latLonToVec3(lat, lon, r = EARTH_RADIUS) {
  const phi = lat * DEG;
  const lam = lon * DEG;
  return new Vector3(
    r * Math.cos(phi) * Math.cos(lam),
    r * Math.sin(phi),
    -r * Math.cos(phi) * Math.sin(lam)
  );
}

/** Inverse of latLonToVec3. */
export function vec3ToLatLon(v) {
  const r = v.length();
  return {
    lat: Math.asin(v.y / r) / DEG,
    lon: Math.atan2(-v.z, v.x) / DEG
  };
}

export function formatCoords(lat, lon) {
  const latH = lat >= 0 ? 'N' : 'S';
  const lonH = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latH}, ${Math.abs(lon).toFixed(4)}° ${lonH}`;
}

/**
 * Parse a wide variety of human-friendly coordinate strings.
 * Returns { lat, lon } or null.
 *
 * Supports:
 *   - Decimal:        "48.8566, 2.3522"  or  "48.8566 2.3522"
 *   - DMS w/ hemis:   "40°42'46\"N 74°00'21\"W"
 *   - Mixed:          "40°42'N 74°00'W"
 *   - Google Maps:    "40.7128° N, 74.0060° W"
 */
export function parseCoords(input) {
  if (!input) return null;
  const s = input.trim();

  // 1) Plain decimal pair
  const dec = s.match(
    /^\s*(-?\d+(?:\.\d+)?)\s*°?\s*[,\s]\s*(-?\d+(?:\.\d+)?)\s*°?\s*$/
  );
  if (dec) {
    const lat = parseFloat(dec[1]);
    const lon = parseFloat(dec[2]);
    if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) return { lat, lon };
  }

  // 2) DMS with hemisphere letters
  const dmsRe =
    /(\d+(?:\.\d+)?)\s*°?\s*(?:(\d+(?:\.\d+)?)\s*[\'’]?\s*)?(?:(\d+(?:\.\d+)?)\s*[\"”]?\s*)?([NSEWnsew])/g;
  const matches = [...s.matchAll(dmsRe)];
  if (matches.length >= 2) {
    const toDec = (m) => {
      const deg = parseFloat(m[1]);
      const min = m[2] ? parseFloat(m[2]) : 0;
      const sec = m[3] ? parseFloat(m[3]) : 0;
      const hem = m[4].toUpperCase();
      let val = deg + min / 60 + sec / 3600;
      if (hem === 'S' || hem === 'W') val = -val;
      return { val, hem };
    };
    const parts = matches.map(toDec);
    const latPart = parts.find((p) => p.hem === 'N' || p.hem === 'S');
    const lonPart = parts.find((p) => p.hem === 'E' || p.hem === 'W');
    if (latPart && lonPart) {
      if (Math.abs(latPart.val) <= 90 && Math.abs(lonPart.val) <= 180)
        return { lat: latPart.val, lon: lonPart.val };
    }
  }

  // 3) Google Maps style ("40.7128° N, 74.0060° W")
  const gm = s.match(
    /(-?\d+(?:\.\d+)?)\s*°?\s*([NSns])?\s*[,\s]+\s*(-?\d+(?:\.\d+)?)\s*°?\s*([EWew])?/
  );
  if (gm) {
    let lat = parseFloat(gm[1]);
    let lon = parseFloat(gm[3]);
    if (gm[2] && gm[2].toUpperCase() === 'S') lat = -Math.abs(lat);
    if (gm[2] && gm[2].toUpperCase() === 'N') lat = Math.abs(lat);
    if (gm[4] && gm[4].toUpperCase() === 'W') lon = -Math.abs(lon);
    if (gm[4] && gm[4].toUpperCase() === 'E') lon = Math.abs(lon);
    if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) return { lat, lon };
  }

  return null;
}
