// Ocean classification.
//
// Two strategies:
//   1. classifyOceanPolys(lat, lon, parsed) — accurate, uses Natural Earth
//      marine polygons. Returns the most specific named feature (sea / gulf /
//      bay / ocean). Requires polygons to be loaded first.
//   2. classifyOcean(lat, lon) — bbox fallback when polygons aren't loaded.
//      Coarse but offline-free.

export const OCEANS = {
  'Pacific Ocean': {
    area: 165250000,      // km²
    avgDepthM: 4280,
    maxDepthM: 10911,
    maxDepthName: 'Challenger Deep',
    info: 'Largest and deepest ocean. Spans from Asia/Oceania to the Americas.'
  },
  'Atlantic Ocean': {
    area: 106460000,
    avgDepthM: 3646,
    maxDepthM: 8376,
    maxDepthName: 'Milwaukee Deep',
    info: 'Second-largest ocean. Separates the Americas from Europe and Africa.'
  },
  'Indian Ocean': {
    area: 70560000,
    avgDepthM: 3741,
    maxDepthM: 7258,
    maxDepthName: 'Sunda Trench',
    info: 'Third-largest ocean. Bounded by Africa, Asia, Australia, and the Southern Ocean.'
  },
  'Southern Ocean': {
    area: 21960000,
    avgDepthM: 3270,
    maxDepthM: 7236,
    maxDepthName: 'South Sandwich Trench',
    info: 'Encircles Antarctica south of 60°S. Recognized as a distinct ocean by the IHO.'
  },
  'Arctic Ocean': {
    area: 15558000,
    avgDepthM: 1205,
    maxDepthM: 5550,
    maxDepthName: 'Molloy Hole',
    info: 'Smallest and shallowest ocean. Largely covered by sea ice.'
  }
};

// Atlantic west boundary follows the eastern edge of the Americas, stepped by
// latitude band. Each entry: { maxLat, lon } — applies for lat < maxLat (and
// above the previous band's maxLat). Order ascending in maxLat.
export const ATLANTIC_WEST_BANDS = [
  { maxLat: -50, lon: -68 },  // Drake passage / southern tip
  { maxLat: -20, lon: -65 },  // Argentina east coast
  { maxLat:   8, lon: -50 },  // Brazil east coast (Atlantic only east of here)
  { maxLat:  30, lon: -98 },  // Gulf of Mexico + Caribbean
  { maxLat:  50, lon: -82 },  // US east coast (east of Florida)
  { maxLat:  66, lon: -55 }   // North Atlantic east of Newfoundland/Labrador
];

const ATLANTIC_EAST_LON = 20;     // Cape Agulhas — Atlantic ↔ Indian
const INDIAN_EAST_LON   = 146.5;  // east edge of Indian Ocean
const INDIAN_NORTH_LAT  = 30;     // north edge of Indian (south Asia)

export function atlanticWestLon(lat) {
  for (const band of ATLANTIC_WEST_BANDS) {
    if (lat < band.maxLat) return band.lon;
  }
  return ATLANTIC_WEST_BANDS[ATLANTIC_WEST_BANDS.length - 1].lon;
}

function parentOceanFacts(name) {
  if (!name) return null;
  const n = name.toLowerCase();
  if (n.includes('pacific')) return { parent: 'Pacific Ocean', ...OCEANS['Pacific Ocean'] };
  if (n.includes('atlantic')) return { parent: 'Atlantic Ocean', ...OCEANS['Atlantic Ocean'] };
  if (n.includes('indian'))   return { parent: 'Indian Ocean',   ...OCEANS['Indian Ocean']   };
  if (n.includes('southern')) return { parent: 'Southern Ocean', ...OCEANS['Southern Ocean'] };
  if (n.includes('arctic'))   return { parent: 'Arctic Ocean',   ...OCEANS['Arctic Ocean']   };
  return null;
}

/**
 * Map a Natural Earth marine feature to the InfoCard payload shape.
 * Returns { name, parent?, info?, area?, avgDepthM?, maxDepthM?, maxDepthName?, featurecla? }.
 */
export function oceanFromFeature(feature) {
  if (!feature) return null;
  const props = feature.properties || {};
  const name = props.name || props.name_long || 'Unnamed sea';
  const featurecla = props.featurecla || null;
  const facts = parentOceanFacts(name);
  if (facts) {
    // Top-level ocean name itself → use facts as primary.
    if (/^(north|south)?\s*(pacific|atlantic|indian|southern|arctic)\s*ocean$/i.test(name)) {
      return { name: facts.parent, featurecla, info: facts.info,
        area: facts.area, avgDepthM: facts.avgDepthM,
        maxDepthM: facts.maxDepthM, maxDepthName: facts.maxDepthName };
    }
    // A named sea / gulf / bay inside an ocean — show the sea name, attach parent.
    return { name, parent: facts.parent, featurecla,
      info: `Part of the ${facts.parent}.` };
  }
  return { name, featurecla, info: null };
}

/** @returns {{name:string} & typeof OCEANS[string] | null} */
export function classifyOcean(lat, lon) {
  // Normalize lon to [-180, 180].
  let L = ((lon + 180) % 360 + 360) % 360 - 180;

  let name;
  if (lat <= -60) name = 'Southern Ocean';
  else if (lat >= 66) name = 'Arctic Ocean';
  else {
    const westA = atlanticWestLon(lat);
    if (L >= westA && L <= ATLANTIC_EAST_LON) name = 'Atlantic Ocean';
    else if (L > ATLANTIC_EAST_LON && L < INDIAN_EAST_LON && lat < INDIAN_NORTH_LAT) name = 'Indian Ocean';
    else name = 'Pacific Ocean';
  }

  return { name, ...OCEANS[name] };
}
