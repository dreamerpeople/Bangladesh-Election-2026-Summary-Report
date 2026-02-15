#!/usr/bin/env node
/**
 * Election 2026 Election Scraper
 * -----------------------------------
 * Scrapes per-constituency vote counts for BNP and NCP/Jamaat (alliance)
 * from: https://www.Election.net/election2026data
 *
 * Output:
 *   - out/bnp_vs_alliance_detail.json (nested: Division → District → Candidates)
 *
 * Notes:
 *  - Uses Puppeteer with stealth plugin to bypass Cloudflare
 *  - Fetches all 300 seats dynamically from Election API
 *  - Parses candidate data from HTML cards with vote counts
 */

const fs = require('fs/promises');
const path = require('path');
const axios = require('axios').default;
const cheerio = require('cheerio');
const he = require('he');
// p-limit may be an ESM default export — support both shapes
const pLimitModule = require('p-limit');
const pLimit = pLimitModule && (pLimitModule.default || pLimitModule);
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// Import the summary detail module
const summaryDetail = require('./summary_detail');

const BASE = 'https://www.Election.net/election2026data';
const ORIGIN = 'https://www.Election.net';
const API_BASE = 'https://www.Election.net/api/districts/district';
const OUT_DIR = path.join(process.cwd(), 'out');
const CONCURRENCY = 3; // be polite to Election
const TIMEOUT_MS = 30_000;

// Party normalization + alliance rules
const PARTY_MAP = {
  BNP: ['bnp', 'bangladesh nationalist'],
  JAMAAT: ['jamaat', 'bangladesh jamaat'],
  NCP: ['ncp', 'national citizens party'],
};
const ALLIANCE_KEYS = ['JAMAAT', 'NCP']; // treat as one "NCP/Jamaat (alliance)"

// Division ID mapping for Election
const DIVISION_MAP = {
  '283793': 'Barisal',
  '284038': 'Chattogram',
  '284613': 'Dhaka',
  '285368': 'Khulna',
  '285718': 'Mymensingh',
  '285918': 'Rajshahi',
  '286298': 'Rangpur',
  '286633': 'Sylhet',
};

const clean = (s) => he.decode(String(s || '').replace(/\s+/g, ' ').trim());

const norm = (s) =>
  clean(s)
    .toLowerCase()
    .normalize('NFKD');

function toNum(s) {
  if (s == null) return null;
  const numStr = String(s).replace(/,/g, '');
  const num = parseInt(numStr, 10);
  return isNaN(num) ? null : num;
}

function mapParty(raw) {
  const n = norm(raw);
  if (!n) return { canonical: clean(raw), key: null };
  for (const [key, needles] of Object.entries(PARTY_MAP)) {
    if (needles.some((w) => n.includes(w))) {
      return { canonical: key, key };
    }
  }
  return { canonical: clean(raw), key: null };
}

// Fetch districts for a division using Election API
async function fetchDistrictsForDivision(divisionId, browser) {
  const url = `${ORIGIN}/api/districts/division/${divisionId}`;
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  );

  let districts = [];
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: TIMEOUT_MS });
    
    const content = await page.content();
    const $ = cheerio.load(content);
    const preText = $('pre').text();
    if (preText) {
      districts = JSON.parse(preText);
    }
  } catch (e) {
    console.error(`Error fetching districts for division ${divisionId}:`, e.message);
  }
  
  await page.close();
  return districts;
}

// Fetch seats for a district using Election API
async function fetchSeatsForDistrict(districtId, browser) {
  const url = `${API_BASE}/${districtId}/seats`;
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  );

  let seats = [];
  
  await page.goto(url, { waitUntil: 'networkidle0', timeout: TIMEOUT_MS });
  
  try {
    const content = await page.content();
    const $ = cheerio.load(content);
    const preText = $('pre').text();
    if (preText) {
      seats = JSON.parse(preText);
    }
  } catch (e) {
    console.error(`Error parsing seats for district ${districtId}:`, e.message);
  }
  
  await page.close();
  return seats;
}

// Parse all seats from a district page
async function parseDistrictResults(divisionId, districtId, districtName, seats, browser) {
  const url = `${BASE}?division=${divisionId}&district=${districtId}`;
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  );

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: TIMEOUT_MS });
    
    // Wait for the seat tabs to load
    try {
      await page.waitForSelector('[id^="seat-"]', { timeout: 10000 });
    } catch (e) {
      console.warn(`Timeout waiting for seats on ${url}`);
    }

    const html = await page.content();
    await page.close();

    const $ = cheerio.load(html);
    const allSeatsData = [];

    // Process each seat in the district
    for (const seat of seats) {
      const seatNumber = seat.SeatId;
      const seatSlug = seat.SeatSlug.toLowerCase();
      
      // Find the seat content div by matching the openTab value
      // Each seat has a div with x-show="openTab === {number}"
      let seatContentDiv = null;
      
      // Try to find the seat content by searching for the seat name in divs
      $('div[x-show]').each((_, elem) => {
        const xShow = $(elem).attr('x-show');
        if (xShow && xShow.includes(`openTab === ${seatNumber}`)) {
          seatContentDiv = $(elem);
          return false; // break
        }
      });

      if (!seatContentDiv || seatContentDiv.length === 0) {
        console.warn(`  ⚠️  Could not find content for ${seat.SeatName}`);
        continue;
      }

      const candidates = [];

      // Parse each candidate card within this seat's content
      seatContentDiv.find('.grid.grid-cols-2 .group').each((_, card) => {
        const $card = $(card);
        
        // Extract candidate name from h3
        const candidateName = clean($card.find('h3').text());
        
        // Extract party from p.text-xs (party tag)
        const partyName = clean($card.find('p.text-xs.font-medium').text());
        
        // Extract votes from div.text-lg.font-bold (vote count)
        const voteText = $card.find('.text-lg.font-bold').text();
        const votes = toNum(voteText);
        
        if (candidateName && partyName) {
          candidates.push({
            candidate: candidateName,
            party: partyName,
            votes: votes || 0,
          });
        }
      });

      if (candidates.length > 0) {
        allSeatsData.push({
          SeatId: seat.SeatId,
          SeatName: seat.SeatName,
          SeatSlug: seat.SeatSlug,
          candidates,
        });
      }
    }

    return allSeatsData;
  } catch (err) {
    console.error(`Error fetching district ${districtName}:`, err.message);
    await page.close();
    return [];
  }
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  console.log('🚀 Launching Puppeteer...');
  const browser = await puppeteer.launch({ 
    headless: 'new', 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  console.log('✅ Puppeteer launched\n');

  console.log('📡 Fetching all constituencies from Election API...\n');
  
  const seatDetails = [];
  let totalBNP = 0;
  let totalAlliance = 0;

  // Process each division
  for (const [divId, divName] of Object.entries(DIVISION_MAP)) {
    console.log(`📍 Fetching districts for ${divName} (${divId})...`);
    
    try {
      const districts = await fetchDistrictsForDivision(divId, browser);
      console.log(`  ✅ Found ${districts.length} districts in ${divName}`);
      
      // Process each district
      for (const district of districts) {
        try {
          const seats = await fetchSeatsForDistrict(district.id, browser);
          console.log(`    📊 Processing ${district.name} with ${seats.length} seats...`);
          
          // Prepare seat info for parsing
          const seatsInfo = seats.map(seat => {
            const seatNumber = seat.id.split('_')[1] || seat.id;
            return {
              SeatSlug: seat.id,
              SeatId: seatNumber,
              SeatName: seat.name,
            };
          });
          
          // Fetch all seats from the district page at once
          const districtSeatsData = await parseDistrictResults(
            divId,
            district.id,
            district.name,
            seatsInfo,
            browser
          );
          
          // Process each seat's data
          for (const seatData of districtSeatsData) {
            // Filter for BNP and Alliance
            const bnpVotes = seatData.candidates
              .filter((c) => {
                const { key } = mapParty(c.party);
                return key === 'BNP';
              })
              .reduce((sum, c) => sum + c.votes, 0);

            const allianceVotes = seatData.candidates
              .filter((c) => {
                const { key } = mapParty(c.party);
                return key && ALLIANCE_KEYS.includes(key);
              })
              .reduce((sum, c) => sum + c.votes, 0);

            totalBNP += bnpVotes;
            totalAlliance += allianceVotes;

            // Store seat details
            seatDetails.push({
              Division: divName,
              District: district.name,
              SeatId: seatData.SeatId,
              SeatName: seatData.SeatName,
              candidates: seatData.candidates.map((c) => ({
                candidate: c.candidate,
                party: c.party,
                partyKey: mapParty(c.party).key,
                votes: c.votes,
              })),
            });

            console.log(
              `    ✅ [${divName}/${district.name}/${seatData.SeatName}] BNP: ${bnpVotes.toLocaleString()} | NCP/Jamaat: ${allianceVotes.toLocaleString()}`
            );
          }
          
          // Update JSON file incrementally after each district
          await summaryDetail.updateDetailedJSON(seatDetails);
          
        } catch (err) {
          console.error(`  ⚠️  Error processing ${district.name}:`, err.message);
        }
      }
    } catch (err) {
      console.error(`❌ Error fetching districts for ${divName}:`, err.message);
    }
  }

  await browser.close();

  console.log('\n✅ Scraping complete!');
  console.log('📄 Output saved to: out/bnp_vs_alliance_detail.json\n');
  console.log('--- GRAND TOTALS ---');
  console.log(`BNP: ${totalBNP.toLocaleString()} votes`);
  console.log(`NCP/Jamaat (alliance): ${totalAlliance.toLocaleString()} votes`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
