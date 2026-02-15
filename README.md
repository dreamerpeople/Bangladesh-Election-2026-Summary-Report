# Bangladesh Election 2026 Summary Report

## Overview
This project provides automated tools to scrape, process, and generate comprehensive summary reports for the 13th Bangladesh National Parliament Election (১৩তম জাতীয় সংসদ নির্বাচন) held in 2026. The system generates an interactive HTML report with advanced features including vote engineering simulation, filtering capabilities, and detailed constituency-wise analysis.

## Election Results Summary
- **Winning Party:** BNP (Bangladesh Nationalist Party)
- **BNP Seats Won:** 210 out of 300 seats
- **NCP and Jamaat Alliance Seats:** 79 out of 300 seats
- **Total Valid Seats:** 289 seats (with results)
- **BNP Total Votes:** 34,961,933
- **Alliance Total Votes (NCP + Jamaat):** 24,065,231
- **Registered Voters:** Over ১২.৭৭ কোটি (12.77 crore)
- **Voting Centers:** ৪২,৭৭৯ (42,779)
- **Registered Political Parties:** ৬০ (60)
- **Voter Turnout:** High participation recorded across all divisions

## Key Features

### Interactive HTML Report
- **Modern Responsive Design:** Beautiful gradient backgrounds and professional styling
- **Vote Engineering Simulation:** Real-time "what-if" scenario testing
  - Adjust vote percentages between -50% to +50%
  - See instant seat distribution changes
  - Visual indicators for winners and losers
- **Advanced Filtering & Search:**
  - Search by Division, District, Seat, or Candidate name
  - Filter by Division (8 divisions covered)
  - Filter by Winner/Non-winner status
- **Comprehensive Data Display:**
  - Division-wise breakdown
  - District-wise results
  - Seat-by-seat vote counts
  - Vote difference calculations
  - Winner indicators with badges
- **Interactive Statistics Cards:**
  - Real-time seat count updates
  - Total vote tallies
  - Winner highlighting with visual effects
  - Dynamic color coding based on results

### Coverage Details
The report covers all 300 parliamentary seats across 8 divisions:
- **Barisal Division:** Complete coverage
- **Chattogram Division:** Complete coverage
- **Dhaka Division:** Complete coverage
- **Khulna Division:** Complete coverage
- **Mymensingh Division:** Complete coverage
- **Rajshahi Division:** Complete coverage
- **Rangpur Division:** Complete coverage
- **Sylhet Division:** Complete coverage

## Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- Stable internet connection for web scraping operations

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Bangladesh-Election-2026-Summary-Report
```

2. Install dependencies:
```bash
npm install
```

## Usage

Run the election result script:
```bash
npm run create
```

This command will:
1. Scrape election data from official sources
2. Process and aggregate vote counts
3. Calculate seat distributions
4. Generate the comprehensive HTML report in the `out/` directory

## Output Files

### Generated Report
- **Location:** `out/election_report_2026.html`
- **File Size:** Comprehensive single-page application
- **Features:**
  - Fully interactive and responsive
  - Print-ready formatting
  - Mobile-friendly design
  - No external dependencies (all styles inline)
  - JavaScript-powered simulations

### Report Sections
1. **Header Section:**
   - Election Commission logo
   - Bilingual titles (English & Bengali)
   - Key statistics (voters, centers, parties)

2. **Summary Section:**
   - Overall election outcome
   - Winning party announcement
   - Vote distribution analysis
   - Campaign insights

3. **Vote Engineering Simulation:**
   - Interactive percentage adjustment controls
   - Real-time seat recalculation
   - Visual feedback on changes
   - Reset to original data option

4. **Statistics Dashboard:**
   - BNP seat count and total votes
   - Alliance seat count and total votes
   - Dynamic winner highlighting
   - Party logos display

5. **Detailed Results Table:**
   - All 300 seats listed
   - Sortable and filterable
   - Vote differences calculated
   - Winner badges
   - Hover effects and styling

6. **Footer Section:**
   - Creator information
   - Organization details
   - Generation timestamp
   - Copyright notice

## Project Structure
```
Bangladesh-Election-2026-Summary-Report/
├── result-script-2026.js    # Main scraping script
├── report.js                 # Report generation module
├── summary_detail.js         # Summary processing
├── package.json              # Project dependencies
├── ec.png                    # Election Commission logo
├── bnp_logo.jpg             # BNP party logo
├── NCP.jpg                  # NCP party logo
├── jamat.jpg                # Jamaat party logo
├── out/                     # Generated output directory
│   └── election_report_2026.html
└── README.md                # This file
```

## Dependencies
- **axios** (^1.x.x) - HTTP client for API requests and web scraping
- **cheerio** (^1.x.x) - HTML parsing and DOM manipulation
- **csv-parse** - CSV file reading and parsing
- **csv-stringify** - CSV file generation
- **puppeteer** (^21.x.x) - Headless browser automation for dynamic content
- **puppeteer-extra** - Enhanced puppeteer with plugin support
- **he** - HTML entity encoding/decoding
- **p-limit** - Control concurrency for parallel operations

## Technical Details

### Data Collection
- Automated web scraping from official election sources
- Concurrent data fetching with rate limiting
- Error handling and retry mechanisms
- Data validation and sanitization

### Report Generation
- Dynamic HTML generation with embedded styling
- JavaScript-powered interactivity
- Responsive CSS Grid and Flexbox layouts
- Gradient backgrounds and animations
- SVG icons and visual enhancements

### Simulation Algorithm
- Vote redistribution calculations
- Real-time DOM updates
- Seat winner recalculation
- Statistical aggregation
- Visual feedback system

## Browser Compatibility
The generated HTML report works on:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Notes
- Large datasets may require significant processing time (5-15 minutes)
- Report file size: ~2-3 MB (with all inline resources)
- Simulation runs instantly in browser (client-side JavaScript)
- Supports filtering 300+ rows with real-time search

## Usage Tips
1. **Filtering:** Use multiple filters simultaneously for precise results
2. **Simulation:** Start with small percentage changes (±5-10%)
3. **Printing:** Use browser print function for PDF export
4. **Search:** Search works on all text fields (Bengali and English)

## Creator Information
**Created by:** Md Mahamudul Hasan  
**Role:** Data Scientist & AI Software Engineer  
**Powered by:** Dreamer People LLC, New Jersey, USA  
**Generated:** February 15, 2026

## License
ISC

## Disclaimer
This report is based on data collected from official sources. Results are presented for informational and analytical purposes. The vote engineering simulation is a hypothetical tool for understanding electoral dynamics and does not represent actual election manipulation.

## Support & Contact
For questions, issues, or contributions, please contact the project maintainers.

---

**© 2026 Dreamer People LLC | All Rights Reserved**
