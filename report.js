#!/usr/bin/env node
/**
 * Bangladesh 13th Election Result Summary Report Generator 2026
 * Generates HTML report from bnp_vs_alliance_detail.json
 */

const fs = require('fs');
const path = require('path');

// Read the JSON data
const dataPath = path.join(__dirname, 'out', 'bnp_vs_alliance_detail.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Process data to get statistics and separate by party
function processData(data) {
  const bnpCandidates = [];
  const allianceCandidates = [];
  const combinedSeats = []; // New: combined seat data
  let bnpWins = 0;
  let allianceWins = 0;
  let bnpTotalVotes = 0;
  let allianceTotalVotes = 0;

  // Process each division
  for (const [division, districts] of Object.entries(data)) {
    for (const [district, seats] of Object.entries(districts)) {
      // Group by seat to find winners
      const seatMap = {};
      
      seats.forEach(candidate => {
        const seatKey = candidate.SeatName;
        if (!seatMap[seatKey]) {
          seatMap[seatKey] = [];
        }
        seatMap[seatKey].push({
          ...candidate,
          Division: division,
          District: district
        });
      });

      // Find winner for each seat
      for (const [seatName, candidates] of Object.entries(seatMap)) {
        const bnpCandidate = candidates.find(c => c.Party === 'BNP (overall)');
        const allianceCandidate = candidates.find(c => c.Party === 'NCP/Jamaat Alliance (overall)');

        let winner = null;
        
        if (bnpCandidate) {
          const isWinner = !allianceCandidate || bnpCandidate.Votes > allianceCandidate.Votes;
          bnpCandidates.push({
            ...bnpCandidate,
            isWinner
          });
          bnpTotalVotes += bnpCandidate.Votes;
          if (isWinner) {
            bnpWins++;
            winner = 'BNP';
          }
        }

        if (allianceCandidate) {
          const isWinner = !bnpCandidate || allianceCandidate.Votes > bnpCandidate.Votes;
          allianceCandidates.push({
            ...allianceCandidate,
            isWinner
          });
          allianceTotalVotes += allianceCandidate.Votes;
          if (isWinner) {
            allianceWins++;
            winner = 'Alliance';
          }
        }
        
        // Create combined seat entry
        combinedSeats.push({
          Division: division,
          District: district,
          SeatId: bnpCandidate?.SeatId || allianceCandidate?.SeatId,
          SeatName: seatName,
          BNPCandidate: bnpCandidate?.CandidateName || 'N/A',
          BNPVotes: bnpCandidate?.Votes || 0,
          AllianceCandidate: allianceCandidate?.CandidateName || 'N/A',
          AllianceVotes: allianceCandidate?.Votes || 0,
          Winner: winner
        });
      }
    }
  }

  return {
    bnpCandidates,
    allianceCandidates,
    combinedSeats,
    bnpWins,
    allianceWins,
    bnpTotalVotes,
    allianceTotalVotes
  };
}

// Generate HTML report
function generateHTML(stats) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bangladesh 13th Election Result Summary Report 2026</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); 
            line-height: 1.6;
        }

        .container {
            max-width: 100%;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #006a4e 0%, #00563f 100%);
            color: white;
            padding: 20px 20px;
            position: relative;
            overflow: hidden;
            margin-bottom: 10px;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 15s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.1) rotate(180deg); }
        }

        .header-content {
            position: relative;
            z-index: 1;
        }

        .header-content-logo-area {
            display: flex;
            align-items: center;
            gap: 30px; 
        }

        .logo {
            width: 140px;
            height: 140px;
            flex-shrink: 0;
            background: white;
            border-radius: 50%;
            padding: 15px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 50%;
        }

        h1 {
            font-size: 2.8em;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            flex: 1;
            line-height: 1.2;
        }

        .bangla-title {
            font-size: 2.2em;
            margin: 0px 0 10px 0;
            font-weight: 600;
            text-align: center;
            letter-spacing: 1px;
            margin-top: -30px;
        }

        .election-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 30px;
            padding: 25px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .info-item {
            text-align: center;
            padding: 20px;
            background: rgba(255, 255, 255, 0.25);
            border-radius: 10px;
            transition: transform 0.3s ease;
        }

        .info-item:hover {
            transform: translateY(-3px);
            background: rgba(255, 255, 255, 0.3);
        }

        .info-label {
            font-size: 1em;
            opacity: 0.95;
            margin-bottom: 8px;
            font-weight: 500;
        }

        .info-value {
            font-size: 1.8em;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 2);
        }

        .content {
            padding: 40px;
        }
            .party-header-block{
                display: flex;
                align-items: center;
                }
        .party-header-text{
                    margin-left: 10px;
    align-items: center;
    margin-top: -4px;
            }

        .summary {
            // background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            // color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom:20px;
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);
        }

        .summary h2 {
            font-size: 2em;
            margin-bottom:10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .summary p {
            font-size: 1.1em;
            line-height: 1.8;
            margin-bottom: 0px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 10px;
        }

        .stat-card {
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .stat-card.bnp {
            background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
            color: white;
        }

        .stat-card.alliance {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
        }

        /* When Alliance wins, it turns green */
        .stat-card.alliance.winner-highlight {
            background: linear-gradient(135deg, #4caf50 0%, #45a049 100%) !important;
            box-shadow: 0 0 25px rgba(76, 175, 80, 0.6);
            border: 3px solid #2e7d32;
        }

        /* When Alliance wins, BNP turns to purple/pink */
        .stat-card.bnp.loser-highlight {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            border: none;
        }

        .logo-party {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: contain;
            flex-shrink: 0;
        }

        .stat-info {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
            flex: 1;
        }

        .stat-number {
            font-size: 42px;
            font-weight: bold;
            margin: 10px 0;
        }

        .stat-label {
            font-size: 27px;
            opacity: 0.9;
        }

        /* Green background for winners */
        .stat-card.bnp.winner-highlight {
            background: linear-gradient(135deg, #4caf50 0%, #45a049 100%) !important;
            box-shadow: 0 0 25px rgba(76, 175, 80, 0.6);
            border: 3px solid #2e7d32;
        }

        .stat-card.alliance.winner-highlight {
            background: linear-gradient(135deg, #4caf50 0%, #45a049 100%) !important;
            box-shadow: 0 0 25px rgba(76, 175, 80, 0.6);
            border: 3px solid #2e7d32;
        }

        .party-section {
            margin-bottom: 50px;
        }

        .party-header {
            padding: 20px;
            border-radius: 12px 12px 0 0;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 0;
            background: linear-gradient(135deg, #006a4e 0%, #00563f 100%);
        }

        .party-header.bnp {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .party-header.alliance {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .party-header.h2 {
            font-size: 2em;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .party-stats {
            text-align: right;
        }
        
        .party-logo-header {
            display: flex;
            justify-content: space-around;
            align-items: center;
            background: #f8f9fa;
            padding: 30px 20px;
            border-left: 3px solid #667eea;
            border-right: 3px solid #667eea;
        }
        
        .party-logo-item {
            text-align: center;
            flex: 1;
        }
        
        .party-logo-item img {
            width: 100px;
            height: 100px;
            object-fit: contain;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .party-logo-item .party-name {
            font-weight: 600;
            font-size: 1.1em;
            color: #2c3e50;
            margin-top: 8px;
        }
        
        .winner-cell {
            background: linear-gradient(90deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%);
            font-weight: 600;
        }
        
        .winner-badge-inline {
            display: inline-block;
            background: #4caf50;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.75em;
            margin-left: 8px;
            font-weight: 600;
        }
        
        .candidate-name-block {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 15px;
            border-radius: 8px;
            background: #f8f9fa;
            min-height: 120px;
        }
        
        .candidate-name-block.winner-highlighted {
            background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }
        
        .candidate-name-block img {
            width: 50px;
            height: 50px;
            object-fit: contain;
            margin-bottom: 8px;
            border-radius: 4px;
        }
        
        .candidate-name-block h4 {
            margin: 0;
            font-size: 1em;
            text-align: center;
            font-weight: 600;
        }
        
        .candidate-name-block .party-label {
            font-size: 0.75em;
            opacity: 0.8;
            margin-top: 4px;
            text-align: center;
        }
        
        .winner-highlighted .party-label {
            opacity: 0.95;
        }

        .simulation-section {
            background: linear-gradient(135deg, #7979d5 0%, #a63add 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 5px 20px rgba(255, 107, 107, 0.3);
        }

        .simulation-section h2 {
            font-size: 2em;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .simulation-intro {
            font-size: 1.05em;
            line-height: 1.6;
            margin-bottom: 25px;
            opacity: 0.95;
        }

        .simulation-controls {
            background: rgba(255, 255, 255, 0.15);
            padding: 25px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .control-group {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
            margin-bottom: 0px;
        }

        .percentage-input-group {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .btn-adjust {
            background: rgba(255, 255, 255, 0.3);
            border: 2px solid white;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            font-size: 1.5em;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .btn-adjust:hover {
            background: rgba(255, 255, 255, 0.5);
            transform: scale(1.05);
        }

        .percentage-input {
            width: 100px;
            padding: 10px 15px;
            border: 2px solid white;
            border-radius: 8px;
            font-size: 1.1em;
            text-align: center;
            font-weight: 600;
            background: rgba(255, 255, 255, 0.9);
        }

        .percentage-input:focus {
            outline: none;
            background: white;
        }

        .btn-submit, .btn-reset {
            padding: 12px 30px;
            border: none;
            border-radius: 8px;
            font-size: 1.1em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-submit {
            background: #4caf50;
            color: white;
        }

        .btn-submit:hover {
            background: #45a049;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
        }

        .btn-reset {
            background: rgba(255, 255, 255, 0.3);
            color: white;
            border: 2px solid white;
        }

        .btn-reset:hover {
            background: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
        }

        .button-group {
            display: flex;
            gap: 15px;
            margin-top: 20px;
        }

        .simulation-info-box {
                margin-top: 20px;
    padding: 20px;
    background: rgb(18 18 18 / 25%);
    border-radius: 10px;
    /* border-left: 4px solid #4caf50; */
    display: none;
    align-items: center;
    gap: 15px;
    backdrop-filter: blur(10px);
    animation: slideDown 0.3s ease;
        }

        .simulation-info-box.show {
            display: flex;
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .info-icon {
            width: 40px;
            height: 40px;
            background: #4caf50;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 24px;
            font-weight: bold;
            color: white;
        }

        .info-text {
            flex: 1;
            font-size: 1.05em;
            line-height: 1.6;
        }

        .info-text strong {
            font-weight: 700;
            color: #ffffff;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
        }

        .stat-card.winner-highlight {
            box-shadow: 0 0 20px rgba(76, 175, 80, 0.6);
            border: 3px solid #4caf50;
        }

        .vote-difference {
            font-weight: 600;
            white-space: nowrap;
        }

        .vote-difference.positive {
            color: #4caf50;
        }

        .vote-difference.negative {
            color: #f44336;
        }

        .filter-search {
            padding: 20px;
            background: #f8f9fa;
            border-left: 3px solid #667eea;
            border-right: 3px solid #667eea;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            align-items: center;
        }

        .filter-search input,
        .filter-search select {
            padding: 10px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 1em;
            flex: 1;
            min-width: 200px;
        }

        .filter-search input:focus,
        .filter-search select:focus {
            outline: none;
            border-color: #667eea;
        }

        .table-container {
            overflow-x: auto;
            border-radius: 0 0 12px 12px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
        }

        thead {
            background: #f8f9fa;
            position: sticky;
            top: 0;
            z-index: 10;
        }

        th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: #2c3e50;
            border-bottom: 2px solid #e0e0e0;
            white-space: nowrap;
        }

        td {
            padding: 12px 15px;
            border-bottom: 1px solid #f0f0f0;
        }

        tbody tr {
            transition: background-color 0.2s ease;
        }

        tbody tr:hover {
            background-color: #f8f9fa;
        }

        .winner-row {
            background: linear-gradient(90deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
            font-weight: 500;
        }

        .winner-row td:first-child::before {
            content: '🏆 ';
            margin-right: 5px;
        }

        .votes {
            font-weight: 600;
            color: #667eea;
            white-space: nowrap;
        }

        .winner-row .votes {
            color: #4caf50;
            font-size: 1.1em;
        }

        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
            text-transform: uppercase;
        }

        .badge.winner {
            background: #4caf50;
            color: white;
        }

        .footer {
            background: linear-gradient(135deg, #006a4e 0%, #00563f 100%);
            color: white;
            padding: 50px 40px 30px 40px;
            text-align: center;
            margin-top: 60px;
            position: relative;
            overflow: hidden;
        }

        .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #f093fb 0%, #667eea 50%, #4caf50 100%);
        }

        .footer-content {
            position: relative;
            z-index: 1;
            max-width: 1200px;
            margin: 0 auto;
        }

        .footer-logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: white;
            border-radius: 50%;
            padding: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .footer-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .footer-title {
            font-size: 1.8em;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .footer-bangla {
            font-size: 1.3em;
            margin-bottom: 25px;
            opacity: 0.95;
            font-weight: 500;
        }

        .footer-divider {
            width: 100px;
            height: 3px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
            margin: 30px auto;
        }

        .footer-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            margin: 30px 0;
            text-align: left;
        }

        .footer-section {
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .footer-section h3 {
            font-size: 1.2em;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .footer-section p {
            margin: 8px 0;
            opacity: 0.9;
            line-height: 1.6;
        }

        .footer-icon {
            display: inline-block;
            width: 24px;
            height: 24px;
        }

        .powered-by {
            margin-top: 35px;
            padding-top: 25px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            font-size: 0.95em;
        }

        .powered-by p {
            margin: 5px 0;
            opacity: 0.85;
        }

        .powered-by strong {
            color: #ffd700;
            font-weight: 600;
        }

        .footer-date {
            margin-top: 20px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            font-size: 1.05em;
            display: inline-block;
        }

        .footer-copyright {
            margin-top: 25px;
            font-size: 0.9em;
            opacity: 0.7;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .container {
                box-shadow: none;
            }
            
            .filter-search {
                display: none;
            }
            
            tbody tr:hover {
                background-color: transparent;
            }
        }

        @media (max-width: 768px) {
            .header-content-logo-area {
                flex-direction: column;
                text-align: center;
            }

            .logo {
                margin-right: 0;
                margin-bottom: 20px;
            }

            h1 {
                font-size: 1.8em;
            }
            
            .bangla-title {
                font-size: 1.5em;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .party-header {
                flex-direction: column;
                text-align: center;
                gap: 15px;
            }
            
            .party-stats {
                text-align: center;
            }
            
            table {
                font-size: 0.9em;
            }
            
            th, td {
                padding: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-content">
                <div class="header-content-logo-area">
                    <div class="logo">
                        <img src="../ec.png" alt="Bangladesh Election Commission Logo">
                    </div>
                    <h1>Bangladesh 13th Election Result Summary Report 2026</h1>
                </div>
                
                <div class="bangla-title">১৩তম জাতীয় সংসদ নির্বাচন</div>
                
                <div class="election-info">
                    <div class="info-item">
                        <div class="info-label">নিবন্ধিত ভোটার</div>
                        <div class="info-value">১২.৭৭ কোটি+</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">ভোটকেন্দ্র</div>
                        <div class="info-value">৪২,৭৭৯</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">নিবন্ধিত রাজনৈতিক দল</div>
                        <div class="info-value">৬০</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Summary -->
            <div class="summary">
                <h2>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                    </svg>
                   Bangladesh Election 2026 Result Summary
                </h2>
                <p><strong>Winning Party: BNP</strong></p>
                <p>BNP secured <strong>${stats.bnpWins} out of 300 seats</strong>, marking a significant victory in the ১৩তম জাতীয় সংসদ নির্বাচন. The NCP and Jamaat Alliance (overall) won <strong>${stats.allianceWins} out of 300 seats</strong>.</p>
                <p>The election witnessed a high voter turnout, with registered voters exceeding ১২.৭৭ কোটি and a total of ৪২,৭৭৯ voting centers across the country. A total of ৬০ political parties participated in the election, showcasing a vibrant democratic process.</p>
                <p>BNP's success can be attributed to its effective campaign strategy and widespread support among voters. The party's strong performance was evident across various divisions, with notable wins in key districts.</p>
            </div>

            <!-- Simulation Section -->
            <div class="simulation-section">
                <h2>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Vote Engineering Simulation
                </h2>
                <p class="simulation-intro">
                    Test "what-if" scenarios by adjusting vote percentages. See how vote shifts between BNP and 
                    NCP/Jamaat Alliance affect seat distribution and election outcomes in real-time. 
                    Use the controls below to increase or decrease Alliance votes by any percentage.
                </p>
                
                <div class="simulation-controls">
                    <div class="control-group">
                        <label for="percentageInput">Election Engineering:</label>
                        <div class="percentage-input-group">
                            <button class="btn-adjust" onclick="decrementPercentage()">−</button>
                            <input 
                                type="number" 
                                id="percentageInput" 
                                class="percentage-input" 
                                value="10" 
                                min="-50" 
                                max="50" 
                                step="1"
                                onkeypress="handleEnterKey(event)"
                            >
                            <button class="btn-adjust" onclick="incrementPercentage()">+</button>
                            <span style="font-size: 1.1em; margin-left: 5px;">%</span>
                        </div>
                    </div>
                    
                    <div class="button-group">
                        <button class="btn-submit" onclick="applySimulation()">
                            Apply Simulation
                        </button>
                        <button class="btn-reset" onclick="resetSimulation()">
                            Reset to Original
                        </button>
                    </div>
                    
                    <!-- Info Box -->
                    <div class="simulation-info-box" id="simulationInfoBox">
                        <div class="info-icon">ℹ️</div>
                        <div class="info-text">
                            <strong>Simulation Applied!</strong> Added <span id="infoPercentage">10</span>% votes to NCP/Jamaat Alliance. 
                            Check the updated seat counts above and individual seat results in the table below to see how the vote redistribution affects the election outcome.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Statistics Cards -->
            <div class="stats-grid" id="statsGrid">
                <div class="stat-card bnp" id="bnpStatCard">
                    <img src="../bnp_logo.jpg" alt="BNP Logo" class="logo-party">
                    <div class="stat-info">
                        <div class="stat-label">BNP</div>
                        <div class="stat-number" id="bnpSeatsWon">${stats.bnpWins}</div>
                        <div class="stat-label">Seats Won</div>
                        <div style="margin-top: 15px; font-size: 1.1em;">
                            Total Votes: <span id="bnpTotalVotes">${stats.bnpTotalVotes.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                
                <div class="stat-card alliance" id="allianceStatCard">
                    <img src="../NCP.jpg" alt="Alliance Logo" class="logo-party">
                    <div class="stat-info">
                        <div class="stat-label">NCP/Jamaat Alliance</div>
                        <div class="stat-number" id="allianceSeatsWon">${stats.allianceWins}</div>
                        <div class="stat-label">Seats Won</div>
                        <div style="margin-top: 15px; font-size: 1.1em;">
                            Total Votes: <span id="allianceTotalVotes">${stats.allianceTotalVotes.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Combined Table -->
            <div class="party-section">
                <div class="party-header">
                    <h2 id="tableHeaderTitle" class="party-header-block">
                        <svg width="35" height="35" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span class="party-header-text"> Bangladesh Election 2026 Vote count of 300 seats</span>
                      
                    </h2>
                </div>


                
               <!-- <div class="party-logo-header">
                    <div class="party-logo-item">
                        <img src="../bnp_logo.jpg" alt="BNP Logo">
                        <div class="party-name">BNP</div>
                    </div>
                    <div class="party-logo-item">
                        <img src="../NCP.jpg" alt="NCP Logo">
                        <div class="party-name">National Change Party (NCP)</div>
                    </div>
                    <div class="party-logo-item">
                        <img src="../jamat.jpg" alt="Jamaat Logo">
                        <div class="party-name">Bangladesh Jamaat-e-Islami</div>
                    </div>
                </div>-->
 
                <div class="filter-search">
                    <input type="text" id="combinedSearch" placeholder="🔍 Search by Division, District, Seat, or Candidate..." onkeyup="filterTable('combinedTable', 'combinedSearch')">
                    <select id="combinedDivisionFilter" onchange="filterTable('combinedTable', 'combinedSearch')">
                        <option value="">All Divisions</option>
                        ${[...new Set(stats.combinedSeats.map(c => c.Division))].sort().map(d => `<option value="${d}">${d}</option>`).join('')}
                    </select>
                    <select id="combinedWinnerFilter" onchange="filterTable('combinedTable', 'combinedSearch')">
                        <option value="">All Results</option>
                        <option value="winner">Winners Only</option>
                        <option value="non-winner">Non-Winners Only</option>
                    </select>
                </div>

                <div class="table-container">
                    <table id="combinedTable">
                        <thead>
                            <tr>
                                <th>Division</th>
                                <th>District</th>
                                <th>Seat ID</th>
                                <th>Seat Name</th>
                                <th>BNP Candidate</th>
                                <th>BNP Votes</th>
                                <th>Alliance (NCP + Jamaat) Candidate</th>
                                <th>Alliance Votes (NCP + Jamaat)</th>
                                <th>Vote Difference</th>
                                <th>Winner</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${stats.combinedSeats.map(c => {
                                const voteDiff = c.BNPVotes - c.AllianceVotes;
                                const diffClass = voteDiff > 0 ? 'positive' : 'negative';
                                return `
                                <tr class="${c.Winner ? 'winner-row' : ''}" 
                                    data-division="${c.Division}" 
                                    data-winner="${c.Winner ? 'winner' : 'non-winner'}"
                                    data-bnp-votes="${c.BNPVotes}"
                                    data-alliance-votes="${c.AllianceVotes}"
                                    data-seat-id="${c.SeatId}">
                                    <td>${c.Division}</td>
                                    <td>${c.District}</td>
                                    <td>${c.SeatId}</td>
                                    <td>${c.SeatName}</td>
                                    <td>
                                        <div class="candidate-name-block ${c.Winner === 'BNP' ? 'winner-highlighted' : ''}" data-party="BNP">
                                            <img src="../bnp_logo.jpg" alt="BNP Logo">
                                            <h4>${c.BNPCandidate}</h4>
                                            <div class="party-label">BNP</div>
                                        </div>
                                    </td>
                                    <td class="votes bnp-votes">${c.BNPVotes.toLocaleString()}</td>
                                    <td>
                                        <div class="candidate-name-block ${c.Winner === 'Alliance' ? 'winner-highlighted' : ''}" data-party="Alliance">
                                            <img src="../NCP.jpg" alt="Alliance Logo">
                                            <h4>${c.AllianceCandidate}</h4>
                                            <div class="party-label">NCP/Jamaat Alliance</div>
                                        </div>
                                    </td>
                                    <td class="votes alliance-votes">${c.AllianceVotes.toLocaleString()}</td>
                                    <td class="vote-difference ${diffClass}">${voteDiff > 0 ? '+' : ''}${voteDiff.toLocaleString()}</td>
                                    <td class="${c.Winner ? 'winner-cell' : ''} winner-column">${c.Winner === 'BNP' ? '<span class="winner-badge-inline">BNP</span>' : c.Winner === 'Alliance' ? '<span class="winner-badge-inline">NCP/Jamaat Alliance</span>' : '-'}</td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer"> 
            <div class="footer-content">
                <div class="footer-logo">
                    <img src="../ec.png" alt="Bangladesh Election Commission Logo">
                </div>
                <div class="footer-title">Bangladesh 13th National Election - 2026</div>
                <div class="footer-bangla">১৩তম জাতীয় সংসদ নির্বাচন</div>
                <div class="footer-divider"></div>
                <div class="footer-info">
                    <div class="footer-section">
                        <h3>
                            <svg class="footer-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            Created By
                        </h3>
                        <p>Md Mahamudul Hasan</p>
                        <p>Data Scientist & AI Software Engeenier</p>
                    </div>
                    <div class="footer-section">
                        <h3>
                            <svg class="footer-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            Powered By
                        </h3>
                        <p>Dreamer People LLC. All rights reserved.</p>
                        <p>New Jersey, USA</p>
                    </div>
                </div>
                <div class="footer-date">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div class="footer-copyright">© 2026 Bangladesh Election Commission</div>
            </div>
        </div>
    </div>

    <script>
        function filterTable(tableId, searchId) {
            const table = document.getElementById(tableId);
            const searchInput = document.getElementById(searchId);
            const divisionFilter = document.getElementById(tableId === 'combinedTable' ? 'combinedDivisionFilter' : 'combinedDivisionFilter');
            const winnerFilter = document.getElementById(tableId === 'combinedTable' ? 'combinedWinnerFilter' : 'combinedWinnerFilter');
            
            const searchValue = searchInput.value.toLowerCase();
            const divisionValue = divisionFilter.value.toLowerCase();
            const winnerValue = winnerFilter.value;
            
            const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
            let visibleCount = 0;
            
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const text = row.textContent.toLowerCase();
                const division = row.getAttribute('data-division').toLowerCase();
                const winner = row.getAttribute('data-winner');
                
                const matchesSearch = text.includes(searchValue);
                const matchesDivision = !divisionValue || division === divisionValue;
                const matchesWinner = !winnerValue || winner === winnerValue;
                
                if (matchesSearch && matchesDivision && matchesWinner) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            }
            
            // Show "no results" message if needed
            const tableContainer = table.closest('.table-container');
            let noResults = tableContainer.querySelector('.no-results');
            
            if (visibleCount === 0) {
                if (!noResults) {
                    noResults = document.createElement('div');
                    noResults.className = 'no-results';
                    noResults.textContent = 'No results found matching your criteria.';
                    tableContainer.appendChild(noResults);
                }
            } else {
                if (noResults) {
                    noResults.remove();
                }
            }
        }

        // Print functionality
        function printReport() {
            window.print();
        }

        // Simulation functions
        function incrementPercentage() {
            const input = document.getElementById('percentageInput');
            const currentValue = parseFloat(input.value) || 0;
            input.value = Math.min(50, currentValue + 1);
        }

        function decrementPercentage() {
            const input = document.getElementById('percentageInput');
            const currentValue = parseFloat(input.value) || 0;
            input.value = Math.max(-50, currentValue - 1);
        }

        function handleEnterKey(event) {
            if (event.key === 'Enter') {
                applySimulation();
            }
        }

        function applySimulation() {
            const percentage = parseFloat(document.getElementById('percentageInput').value) || 0;
            const table = document.getElementById('combinedTable');
            const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
            
            let bnpWins = 0;
            let allianceWins = 0;
            let bnpTotalVotes = 0;
            let allianceTotalVotes = 0;
            
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const originalBNPVotes = parseInt(row.getAttribute('data-bnp-votes'));
                const originalAllianceVotes = parseInt(row.getAttribute('data-alliance-votes'));
                
                // Calculate total votes for this seat
                const totalVotes = originalBNPVotes + originalAllianceVotes;
                const changeAmount = Math.round(totalVotes * (percentage / 100));
                
                // Apply changes: decrease BNP, increase Alliance
                const newBNPVotes = Math.max(0, originalBNPVotes - changeAmount);
                const newAllianceVotes = Math.max(0, originalAllianceVotes + changeAmount);
                
                // Update vote displays
                const bnpVotesCell = row.querySelector('.bnp-votes');
                const allianceVotesCell = row.querySelector('.alliance-votes');
                bnpVotesCell.textContent = newBNPVotes.toLocaleString();
                allianceVotesCell.textContent = newAllianceVotes.toLocaleString();
                
                // Calculate vote difference
                const voteDiff = newBNPVotes - newAllianceVotes;
                const diffCell = row.querySelector('.vote-difference');
                diffCell.textContent = (voteDiff > 0 ? '+' : '') + voteDiff.toLocaleString();
                diffCell.className = 'vote-difference ' + (voteDiff > 0 ? 'positive' : 'negative');
                
                // Determine winner
                let winner = null;
                const bnpBlock = row.querySelector('[data-party="BNP"]');
                const allianceBlock = row.querySelector('[data-party="Alliance"]');
                
                // Remove existing winner highlights
                bnpBlock.classList.remove('winner-highlighted');
                allianceBlock.classList.remove('winner-highlighted');
                
                if (newBNPVotes > newAllianceVotes) {
                    winner = 'BNP';
                    bnpBlock.classList.add('winner-highlighted');
                    bnpWins++;
                } else if (newAllianceVotes > newBNPVotes) {
                    winner = 'Alliance';
                    allianceBlock.classList.add('winner-highlighted');
                    allianceWins++;
                }
                
                // Update winner column
                const winnerCell = row.querySelector('.winner-column');
                if (winner === 'BNP') {
                    winnerCell.innerHTML = '<span class="winner-badge-inline">BNP</span>';
                    winnerCell.className = 'winner-cell winner-column';
                } else if (winner === 'Alliance') {
                    winnerCell.innerHTML = '<span class="winner-badge-inline">NCP/Jamaat Alliance</span>';
                    winnerCell.className = 'winner-cell winner-column';
                } else {
                    winnerCell.innerHTML = '-';
                    winnerCell.className = 'winner-column';
                }
                
                // Update row styling
                if (winner) {
                    row.classList.add('winner-row');
                    row.setAttribute('data-winner', 'winner');
                } else {
                    row.classList.remove('winner-row');
                    row.setAttribute('data-winner', 'non-winner');
                }
                
                // Accumulate total votes
                bnpTotalVotes += newBNPVotes;
                allianceTotalVotes += newAllianceVotes;
            }
            
            // Update statistics cards
            document.getElementById('bnpSeatsWon').textContent = bnpWins;
            document.getElementById('allianceSeatsWon').textContent = allianceWins;
            document.getElementById('bnpTotalVotes').textContent = bnpTotalVotes.toLocaleString();
            document.getElementById('allianceTotalVotes').textContent = allianceTotalVotes.toLocaleString();
            
            // Update winner highlight on cards
            const bnpCard = document.getElementById('bnpStatCard');
            const allianceCard = document.getElementById('allianceStatCard');
            
            bnpCard.classList.remove('winner-highlight', 'loser-highlight');
            allianceCard.classList.remove('winner-highlight', 'loser-highlight');
            
            if (bnpWins > allianceWins) {
                bnpCard.classList.add('winner-highlight');
                allianceCard.classList.add('loser-highlight');
            } else if (allianceWins > bnpWins) {
                allianceCard.classList.add('winner-highlight');
                bnpCard.classList.add('loser-highlight');
            }
            
            // Update table header title
            const headerTitle = document.getElementById('tableHeaderTitle');
            headerTitle.innerHTML = '<svg width="35" height="35" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> Simulation Applied: Bangladesh Election 2026 Vote count of 300 seats';
            
            // Show info box and update percentage
            const infoBox = document.getElementById('simulationInfoBox');
            const infoPercentage = document.getElementById('infoPercentage');
            infoPercentage.textContent = Math.abs(percentage);
            infoBox.classList.add('show');
        }

        function resetSimulation() {
            // Reset percentage input
            document.getElementById('percentageInput').value = 10;
            
            const table = document.getElementById('combinedTable');
            const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
            
            let bnpWins = 0;
            let allianceWins = 0;
            let bnpTotalVotes = 0;
            let allianceTotalVotes = 0;
            
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const originalBNPVotes = parseInt(row.getAttribute('data-bnp-votes'));
                const originalAllianceVotes = parseInt(row.getAttribute('data-alliance-votes'));
                
                // Restore original votes
                const bnpVotesCell = row.querySelector('.bnp-votes');
                const allianceVotesCell = row.querySelector('.alliance-votes');
                bnpVotesCell.textContent = originalBNPVotes.toLocaleString();
                allianceVotesCell.textContent = originalAllianceVotes.toLocaleString();
                
                // Restore vote difference
                const voteDiff = originalBNPVotes - originalAllianceVotes;
                const diffCell = row.querySelector('.vote-difference');
                diffCell.textContent = (voteDiff > 0 ? '+' : '') + voteDiff.toLocaleString();
                diffCell.className = 'vote-difference ' + (voteDiff > 0 ? 'positive' : 'negative');
                
                // Restore winner
                let winner = null;
                const bnpBlock = row.querySelector('[data-party="BNP"]');
                const allianceBlock = row.querySelector('[data-party="Alliance"]');
                
                bnpBlock.classList.remove('winner-highlighted');
                allianceBlock.classList.remove('winner-highlighted');
                
                if (originalBNPVotes > originalAllianceVotes) {
                    winner = 'BNP';
                    bnpBlock.classList.add('winner-highlighted');
                    bnpWins++;
                } else if (originalAllianceVotes > originalBNPVotes) {
                    winner = 'Alliance';
                    allianceBlock.classList.add('winner-highlighted');
                    allianceWins++;
                }
                
                // Restore winner column
                const winnerCell = row.querySelector('.winner-column');
                if (winner === 'BNP') {
                    winnerCell.innerHTML = '<span class="winner-badge-inline">BNP</span>';
                    winnerCell.className = 'winner-cell winner-column';
                } else if (winner === 'Alliance') {
                    winnerCell.innerHTML = '<span class="winner-badge-inline">NCP/Jamaat Alliance</span>';
                    winnerCell.className = 'winner-cell winner-column';
                } else {
                    winnerCell.innerHTML = '-';
                    winnerCell.className = 'winner-column';
                }
                
                // Restore row styling
                if (winner) {
                    row.classList.add('winner-row');
                    row.setAttribute('data-winner', 'winner');
                } else {
                    row.classList.remove('winner-row');
                    row.setAttribute('data-winner', 'non-winner');
                }
                
                // Accumulate original total votes
                bnpTotalVotes += originalBNPVotes;
                allianceTotalVotes += originalAllianceVotes;
            }
            
            // Restore statistics cards
            document.getElementById('bnpSeatsWon').textContent = bnpWins;
            document.getElementById('allianceSeatsWon').textContent = allianceWins;
            document.getElementById('bnpTotalVotes').textContent = bnpTotalVotes.toLocaleString();
            document.getElementById('allianceTotalVotes').textContent = allianceTotalVotes.toLocaleString();
            
            // Remove winner highlights from cards
            const bnpCard = document.getElementById('bnpStatCard');
            const allianceCard = document.getElementById('allianceStatCard');
            bnpCard.classList.remove('winner-highlight', 'loser-highlight');
            allianceCard.classList.remove('winner-highlight', 'loser-highlight');
            
            if (bnpWins > allianceWins) {
                bnpCard.classList.add('winner-highlight');
            } else if (allianceWins > bnpWins) {
                allianceCard.classList.add('winner-highlight');
            }
            
            // Reset table header title to default
            const headerTitle = document.getElementById('tableHeaderTitle');
            headerTitle.innerHTML = '<svg width="35" height="35" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> Bangladesh Election 2026 Vote count of 300 seats';
            
            // Hide info box
            const infoBox = document.getElementById('simulationInfoBox');
            infoBox.classList.remove('show');
        }

        // Initialize - scroll to top
        window.scrollTo(0, 0);
    </script>
</body>
</html>`;
}

// Main execution
const stats = processData(data);
const html = generateHTML(stats);

// Write HTML file
const outputPath = path.join(__dirname, 'out', 'election_report_2026.html');
fs.writeFileSync(outputPath, html, 'utf8');

console.log('✅ HTML Report generated successfully!');
console.log(`📄 Output file: ${outputPath}`);
console.log(`\n📊 Summary:`);
console.log(`   BNP wins: ${stats.bnpWins} seats`);
console.log(`   Alliance wins: ${stats.allianceWins} seats`);
console.log(`   BNP total votes: ${stats.bnpTotalVotes.toLocaleString()}`);
console.log(`   Alliance total votes: ${stats.allianceTotalVotes.toLocaleString()}`);
console.log(`\n🌐 Open the file in your browser to view the report.`);