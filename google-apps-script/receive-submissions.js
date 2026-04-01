/**
 * Dayton Informs — Google Apps Script: Receive Obituary Submissions
 *
 * This script runs as a web app deployed from Google Apps Script.
 * It receives obituary form submissions from the website and writes
 * them to a Google Sheet for review.
 *
 * SETUP INSTRUCTIONS ARE IN: setup-instructions.md (in this same folder)
 */

// Handle POST requests from the obituary submission form
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Submissions');

    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Submissions');
      // Add headers
      sheet.appendRow([
        'ID', 'Status', 'Full Name', 'Date of Birth', 'Date of Death',
        'City/Neighborhood', 'Survivors', 'Military Service', 'Military Branch',
        'Remembrance', 'Submitter Name', 'Submitter Email', 'Submitted At', 'Published At'
      ]);
      sheet.getRange('1:1').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // Generate a simple unique ID
    var id = 'obit-' + new Date().getTime();

    sheet.appendRow([
      id,
      'PENDING',
      data.fullName || '',
      data.dateOfBirth || '',
      data.dateOfDeath || '',
      data.cityNeighborhood || '',
      data.survivors || '',
      data.militaryService || 'no',
      data.militaryBranch || '',
      data.remembrance || '',
      data.submitterName || '',
      data.submitterEmail || '',
      data.submittedAt || new Date().toISOString(),
      ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', id: id }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (for testing that the script is deployed)
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', service: 'Dayton Informs Submissions' }))
    .setMimeType(ContentService.MimeType.JSON);
}
