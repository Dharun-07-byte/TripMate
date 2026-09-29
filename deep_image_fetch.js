const fs = require('fs');
const path = require('path');

const countriesPath = path.resolve(__dirname, 'backend/countries.json');
const countries = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));

// Curated collection of diverse, unique high-res travel photos (each distinct, never duplicated)
const fallbackPool = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1580834341580-8c17a3a6306e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1580974852861-c381510bc98a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1583531352515-8884af319dc1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?auto=format&fit=crop&w=800&q=80'
];

function isGoodImage(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (lower.includes('.svg') || lower.includes('flag') || lower.includes('coat_of_arms') || lower.includes('locator_map') || lower.includes('orthographic_projection')) {
    return false;
  }
  return true;
}

async function searchWikiImage(term) {
  const url = 'https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=' + 
    encodeURIComponent(term) + 
    '&gsrlimit=3&prop=pageimages&pithumbsize=800&format=json';

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'TripMateApp/1.0 (contact@tripmate.local)' } });
    const data = await res.json();
    const pages = data.query?.pages || {};
    for (const pid in pages) {
      const p = pages[pid];
      if (p.thumbnail && isGoodImage(p.thumbnail.source)) {
        return p.thumbnail.source;
      }
    }
  } catch (e) {
    // Ignore error
  }
  return null;
}

async function enhanceRemainingPlaces() {
  console.log('Searching deep matches for remaining places...');

  let deepFixed = 0;
  let fallbackCounter = 0;

  for (let cIdx = 0; cIdx < countries.length; cIdx++) {
    const country = countries[cIdx];
    for (let pIdx = 0; pIdx < country.places.length; pIdx++) {
      const place = country.places[pIdx];

      // If this place is using a generic unsplash fallback from earlier
      if (!place.image || place.image.includes('images.unsplash.com')) {
        let cleanName = place.name.replace(/\(.*?\)/g, '').trim();
        if (cleanName.includes('&')) cleanName = cleanName.split('&')[0].trim();
        if (cleanName.includes('/')) cleanName = cleanName.split('/')[0].trim();

        // Try variations:
        // 1. cleanName
        let found = await searchWikiImage(cleanName);
        // 2. cleanName + " " + country.name
        if (!found) {
          found = await searchWikiImage(cleanName + ' ' + country.name);
        }
        // 3. strip suffix like 'Valley' / 'National Park'
        if (!found) {
          const stripped = cleanName.replace(/Valley|National Park|Park|Beach|Island|Islands|Old Town/gi, '').trim();
          if (stripped && stripped !== cleanName) {
            found = await searchWikiImage(stripped + ' ' + country.name);
          }
        }

        if (found) {
          place.image = found;
          deepFixed++;
          process.stdout.write(`Found [${place.name}]: ${found.slice(0, 50)}...\n`);
        } else {
          // Unique fallback
          place.image = fallbackPool[fallbackCounter % fallbackPool.length];
          fallbackCounter++;
        }

        // Throttle
        await new Promise(r => setTimeout(r, 80));
      }
    }
  }

  console.log(`\nDeep Search completed! Enhanced ${deepFixed} additional places with direct authentic photos.`);

  // Save backend/countries.json
  fs.writeFileSync(countriesPath, JSON.stringify(countries, null, 2), 'utf8');
  console.log('Saved backend/countries.json');

  // Save frontend/src/countriesData.js
  const frontendDataPath = path.resolve(__dirname, 'frontend/src/countriesData.js');
  const fileHeader = `// ============================================================================
// TripMate Global Countries Database
// Stored strictly in ALPHABETICAL ORDER (A - Z) by country name
// Every country contains separate locations with individual images and costs in INR
// ============================================================================

export const WORLD_COUNTRIES = ${JSON.stringify(countries, null, 2)};

export const ALL_COUNTRY_NAMES = WORLD_COUNTRIES.map(c => c.name);
`;
  fs.writeFileSync(frontendDataPath, fileHeader, 'utf8');
  console.log('Saved frontend/src/countriesData.js');
}

enhanceRemainingPlaces();
