const fs = require('fs/promises');
const path = require('path');

const OUT_DIR = path.join(process.cwd(), 'out');
const DETAIL_FILE = path.join(OUT_DIR, 'bnp_vs_alliance_detail.json');

/**
 * Build nested structure: Division → District → Array of candidates
 * Only includes BNP and NCP/Jamaat Alliance candidates
 */
async function buildDetailedStructure(seatDetails = []) {
  const nestedData = {};

  for (const detail of seatDetails) {
    const div = detail.Division;
    const dist = detail.District;
    const seatId = detail.SeatId;
    const seatName = detail.SeatName || `${dist}-${seatId}`;

    // Initialize nested structure
    if (!nestedData[div]) {
      nestedData[div] = {};
    }
    if (!nestedData[div][dist]) {
      nestedData[div][dist] = [];
    }

    // Add ONLY BNP and Alliance candidates for THIS SPECIFIC seat
    if (detail.candidates && Array.isArray(detail.candidates)) {
      for (const candidate of detail.candidates) {
        const partyKey = candidate.partyKey;
        
        // Only include BNP and Alliance (JAMAAT, NCP) candidates
        if (partyKey === 'BNP' || (partyKey && ['JAMAAT', 'NCP'].includes(partyKey))) {
          const partyLabel = partyKey === 'BNP' 
            ? 'BNP (overall)' 
            : 'NCP/Jamaat Alliance (overall)';
            
          nestedData[div][dist].push({
            SeatId: seatId,
            SeatName: seatName,
            Party: partyLabel,
            CandidateName: candidate.candidate,
            Votes: candidate.votes,
          });
        }
      }
    }
  }

  return nestedData;
}

/**
 * Update the detailed JSON file incrementally
 * Call this after each seat is processed to save progress
 */
async function updateDetailedJSON(seatDetails = []) {
  try {
    const nestedData = await buildDetailedStructure(seatDetails);
    await fs.writeFile(DETAIL_FILE, JSON.stringify(nestedData, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error updating detailed JSON:', err.message);
    return false;
  }
}

/**
 * Initialize the detail file (optional - creates empty structure)
 */
async function initializeDetailFile() {
  try {
    await fs.mkdir(OUT_DIR, { recursive: true });
    const emptyStructure = {};
    await fs.writeFile(DETAIL_FILE, JSON.stringify(emptyStructure, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error initializing detail file:', err.message);
    return false;
  }
}

/**
 * Get the current detailed data from file
 */
async function getDetailedData() {
  try {
    const content = await fs.readFile(DETAIL_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading detailed data:', err.message);
    return {};
  }
}

module.exports = {
  updateDetailedJSON,
  initializeDetailFile,
  getDetailedData,
  buildDetailedStructure,
  DETAIL_FILE,
};