// Rough centroids — used to point the camera at a continent or pick a default
// initial view.
export const CONTINENT_CENTROIDS = {
  'Africa':        { lat:   2, lon:  20 },
  'Antarctica':    { lat: -82, lon:   0 },
  'Asia':          { lat:  40, lon:  90 },
  'Europe':        { lat:  52, lon:  15 },
  'North America': { lat:  45, lon: -100 },
  'Oceania':       { lat: -22, lon:  140 },
  'South America': { lat: -15, lon:  -60 }
};

export const CONTINENTS = Object.keys(CONTINENT_CENTROIDS);
