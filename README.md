# Bangladesh Election 2026 Summary Report

## Overview
This project provides automated tools to scrape, process, and generate comprehensive summary reports for the 13th Bangladesh National Parliament Election (১৩তম জাতীয় সংসদ নির্বাচন) held in 2026.

## Election Results Summary
- **Winning Party:** BNP (overall)
- **BNP Seats:** 210 out of 300
- **NCP and Jamaat Alliance:** 79 out of 300 seats
- **Registered Voters:** Over ১২.৭৭ কোটি (12.77 crore)
- **Voter Turnout:** High participation recorded

## Features
- Automated web scraping of election results
- CSV data processing for seat allocations
- HTML report generation
- Detailed constituency-wise results
- Party-wise seat distribution analysis

## Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

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

This will execute the data collection and report generation process.

## Project Structure
- `result-script-2026.js` - Main script for scraping election results
- `report.js` - Report generation module
- `summary_detail.js` - Summary details processing
- `seats.csv` - Seat allocation data
- `example_html_strcture.html` - HTML template structure
- `ec.png` - Election Commission logo/image

## Dependencies
- **axios** - HTTP client for API requests
- **cheerio** - HTML parsing and web scraping
- **csv-parse/csv-stringify** - CSV file processing
- **puppeteer** - Headless browser automation
- **puppeteer-extra** - Enhanced puppeteer functionality
- **he** - HTML entity encoding/decoding
- **p-limit** - Concurrency control

## License
ISC

## Notes
- Ensure stable internet connection for web scraping operations
- Large datasets may require significant processing time
- Results are based on official election data sources
