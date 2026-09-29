const fs = require('fs');
const path = require('path');

// Curated high quality travel imagery pool categorized by destination style
const imagePool = {
  beach: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // Tropical Beach
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80', // Goa Sunset Beach
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', // Coral Reef
    'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80', // Palawan Lagoon
    'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80', // Sydney Coast
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', // Caribbean Palms
    'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80', // Maldives Overwater
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80', // Amalfi Cliffside
    'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80'  // Santorini Caldera
  ],
  mountain: [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', // High Peaks
    'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80', // Zermatt Matterhorn
    'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80', // Banff Lake Louise
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80', // Himalayas Nepal
    'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80', // Caucasus Georgia
    'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80', // Iceland Glaciers
    'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&q=80', // Mountain lake
    'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80'  // Snow Lapland
  ],
  historical: [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80', // Taj Mahal
    'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80', // Pyramids Egypt
    'https://images.unsplash.com/photo-1580834341580-8c17a3a6306e?auto=format&fit=crop&w=800&q=80', // Petra Jordan
    'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80', // Istanbul Hagia Sophia
    'https://images.unsplash.com/photo-1580974852861-c381510bc98a?auto=format&fit=crop&w=800&q=80', // Armenia Monastery
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80', // Bhutan Tiger Nest
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', // Angkor Wat
    'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80'  // Machu Picchu
  ],
  city: [
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', // Tokyo Skyline
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80', // Paris Eiffel
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80', // Dubai Burj
    'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=800&q=80', // New York City
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80', // London Big Ben
    'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80', // Singapore Marina
    'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=800&q=80', // Prague Old Town
    'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80'  // Bruges Ghent
  ],
  nature: [
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80', // Safari Animals
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80', // Bali Rice Terraces
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80', // Ha Long Bay
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80', // Desert Dunes
    'https://images.unsplash.com/photo-1583531352515-8884af319dc1?auto=format&fit=crop&w=800&q=80', // Cocora Palms
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', // Costa Rica Forest
    'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?auto=format&fit=crop&w=800&q=80', // Norway Fjords
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'  // New Zealand Road
  ]
};

// Refined tag deduction based on specific destination names and keywords
function deduceTag(cityName) {
  const lower = cityName.toLowerCase();
  
  // Beach & Coastal
  if (
    lower.includes('beach') || lower.includes('island') || lower.includes('atoll') || 
    lower.includes('bay') || lower.includes('coast') || lower.includes('coral') || 
    lower.includes('sea') || lower.includes('surf') || lower.includes('goa') || 
    lower.includes('cancun') || lower.includes('tulum') || lower.includes('phuket') || 
    lower.includes('krabi') || lower.includes('boracay') || lower.includes('santorini') || 
    lower.includes('mykonos') || lower.includes('maldives') || lower.includes('fiji') || 
    lower.includes('hawaii') || lower.includes('miami') || lower.includes('nice') || 
    lower.includes('amalfi') || lower.includes('ibiza') || lower.includes('mallorca') || 
    lower.includes('whitsunday') || lower.includes('bali') || lower.includes('canggu')
  ) {
    return 'Coastal & Beaches';
  }

  // Mountain & Peaks
  if (
    lower.includes('mountain') || lower.includes('peak') || lower.includes('valley') || 
    lower.includes('alps') || lower.includes('glacier') || lower.includes('fjord') || 
    lower.includes('hill') || lower.includes('pass') || lower.includes('ladakh') || 
    lower.includes('kashmir') || lower.includes('manali') || lower.includes('zermatt') || 
    lower.includes('interlaken') || lower.includes('banff') || lower.includes('queenstown') || 
    lower.includes('lapland') || lower.includes('andes') || lower.includes('everest') || 
    lower.includes('himalaya') || lower.includes('fuji') || lower.includes('innsbruck') ||
    lower.includes('dolomite') || lower.includes('grindelwald') || lower.includes('chamonix')
  ) {
    return 'Mountain & Scenic Peaks';
  }

  // History & Architecture
  if (
    lower.includes('temple') || lower.includes('cathedral') || lower.includes('basilica') || 
    lower.includes('castle') || lower.includes('palace') || lower.includes('ruins') || 
    lower.includes('chapel') || lower.includes('unesco') || lower.includes('fort') || 
    lower.includes('ancient') || lower.includes('museum') || lower.includes('vatican') || 
    lower.includes('rome') || lower.includes('florence') || lower.includes('athens') || 
    lower.includes('kyoto') || lower.includes('varanasi') || lower.includes('agra') || 
    lower.includes('petra') || lower.includes('luxor') || lower.includes('cairo') || 
    lower.includes('angkor') || lower.includes('machu picchu') || lower.includes('jerusalem')
  ) {
    return 'History & Architecture';
  }

  // Nature, Wildlife, Safari & Parks
  if (
    lower.includes('park') || lower.includes('falls') || lower.includes('lake') || 
    lower.includes('desert') || lower.includes('dunes') || lower.includes('rainforest') || 
    lower.includes('canyon') || lower.includes('safari') || lower.includes('river') || 
    lower.includes('serengeti') || lower.includes('kruger') || lower.includes('maasai mara') || 
    lower.includes('okavango') || lower.includes('amazon') || lower.includes('chobe') || 
    lower.includes('galapagos') || lower.includes('backwaters') || lower.includes('alleppey')
  ) {
    return 'Nature & Wildlife';
  }

  return 'City Culture & Dining';
}

function selectImage(tag, cityIndex) {
  let category = 'city';
  if (tag === 'Coastal & Beaches') category = 'beach';
  else if (tag === 'Mountain & Scenic Peaks') category = 'mountain';
  else if (tag === 'History & Architecture') category = 'historical';
  else if (tag === 'Nature & Wildlife') category = 'nature';

  const list = imagePool[category] || imagePool.city;
  return list[cityIndex % list.length];
}

// Read current countries
const countriesJsonPath = path.resolve(__dirname, 'backend/countries.json');
let countries = JSON.parse(fs.readFileSync(countriesJsonPath, 'utf8'));

const priceMultipliers = [1.2, 0.95, 1.1, 0.85, 1.05, 0.9, 1.15, 0.8, 1.0, 0.92, 1.08];

countries = countries.map(country => {
  const baseCost = country.avgDailyCostINR || 6000;
  const places = country.topCities.map((cityName, idx) => {
    const mult = priceMultipliers[idx % priceMultipliers.length];
    const costINR = Math.round((baseCost * mult) / 50) * 50;
    const tag = deduceTag(cityName);
    const image = selectImage(tag, idx);

    return {
      name: cityName,
      costINR,
      tag,
      image,
      est7DayINR: costINR * 7
    };
  });

  country.places = places;
  return country;
});

// Sort strictly alphabetically
countries.sort((a, b) => a.name.localeCompare(b.name));

console.log(`Processed ${countries.length} countries.`);
console.log(`Total places generated: ${countries.reduce((acc, c) => acc + c.places.length, 0)}`);

// Write updated backend/countries.json
fs.writeFileSync(countriesJsonPath, JSON.stringify(countries, null, 2), 'utf8');
console.log('Saved backend/countries.json');

// Write updated frontend/src/countriesData.js
const fileHeader = `// ============================================================================
// TripMate Global Countries Database
// Stored strictly in ALPHABETICAL ORDER (A - Z) by country name
// Every country contains separate locations with individual images and costs in INR
// ============================================================================

export const WORLD_COUNTRIES = ${JSON.stringify(countries, null, 2)};

// Alphabetically sorted list of all country names
export const ALL_COUNTRY_NAMES = WORLD_COUNTRIES.map(c => c.name);

// Fast O(1) Lookup by Country Name (case-insensitive)
export const COUNTRY_LOOKUP = WORLD_COUNTRIES.reduce((acc, country) => {
  acc[country.name.toLowerCase()] = country;
  return acc;
}, {});

// Helper function to safely find country by name
export const getCountryByName = (name) => {
  if (!name) return null;
  return COUNTRY_LOOKUP[name.toLowerCase()] || null;
};
`;

const frontendPath = path.resolve(__dirname, 'frontend/src/countriesData.js');
fs.writeFileSync(frontendPath, fileHeader, 'utf8');
console.log('Saved frontend/src/countriesData.js');
