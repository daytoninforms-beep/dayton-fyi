/**
 * Dayton Informs — Google Apps Script: Publish Approved Entries to JSON
 *
 * This script reads the "Submissions" sheet, finds all rows with
 * Status = "APPROVED", and generates the obituaries.json content.
 *
 * You then copy the JSON output and paste it into data/obituaries.json
 * in your project folder, then redeploy to Netlify.
 *
 * Run this function from the Apps Script editor after approving submissions.
 */

function generateObituariesJson() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Submissions');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('No "Submissions" sheet found.');
    return;
  }

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var obituaries = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var status = row[1]; // Column B = Status

    if (status !== 'APPROVED') continue;

    obituaries.push({
      id: row[0],
      fullName: row[2],
      dateOfBirth: formatSheetDate(row[3]),
      dateOfDeath: formatSheetDate(row[4]),
      cityNeighborhood: row[5],
      survivors: row[6],
      militaryService: row[7],
      militaryBranch: row[8],
      remembrance: row[9],
      publishedAt: formatSheetDate(row[13]) || new Date().toISOString().split('T')[0]
    });
  }

  // Sort by date of death, most recent first
  obituaries.sort(function(a, b) {
    return new Date(b.dateOfDeath) - new Date(a.dateOfDeath);
  });

  var json = JSON.stringify(obituaries, null, 2);

  // Show the JSON in a dialog so the operator can copy it
  var html = HtmlService
    .createHtmlOutput(
      '<p><strong>Copy everything in the box below</strong> and paste it into <code>data/obituaries.json</code> in your project folder. Then redeploy to Netlify.</p>' +
      '<textarea style="width:100%;height:400px;font-family:monospace;font-size:12px;">' +
      json.replace(/</g, '&lt;') +
      '</textarea>' +
      '<p>Total approved obituaries: ' + obituaries.length + '</p>'
    )
    .setWidth(600)
    .setHeight(550)
    .setTitle('obituaries.json');

  SpreadsheetApp.getUi().showModalDialog(html, 'Published Obituaries JSON');
}

/**
 * Generate meetings.json from the Meetings sheet.
 *
 * The Meetings sheet should have these columns (A through M):
 * ID | Body Name | Meeting Type | Category | Date | Time | Location | Address |
 * Virtual Link | Agenda Link | Minutes Link | Video Link | Description
 */
function generateMeetingsJson() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Meetings');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('No "Meetings" sheet found. Create a sheet named "Meetings" with columns: ID, Body Name, Meeting Type, Category, Date, Time, Location, Address, Virtual Link, Agenda Link, Minutes Link, Video Link, Description');
    return;
  }

  var data = sheet.getDataRange().getValues();
  var meetings = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[1]) continue; // Skip empty rows (check Body Name column)

    // Auto-generate ID if empty
    var id = row[0] || slugify(row[1]) + '-' + formatSheetDate(row[4]);

    // Write generated ID back to column A if it was empty
    if (!row[0]) {
      sheet.getRange(i + 1, 1).setValue(id);
    }

    meetings.push({
      id: id,
      bodyName: row[1] || '',
      meetingType: row[2] || 'Regular',
      category: row[3] || '',
      date: formatSheetDate(row[4]),
      time: row[5] || '',
      location: row[6] || '',
      address: row[7] || '',
      virtualLink: row[8] || '',
      agendaLink: row[9] || '',
      minutesLink: row[10] || '',
      videoLink: row[11] || '',
      description: row[12] || '',
      recurring: true
    });
  }

  // Sort by date
  meetings.sort(function(a, b) {
    return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
  });

  var json = JSON.stringify(meetings, null, 2);

  var html = HtmlService
    .createHtmlOutput(
      '<p><strong>Copy everything in the box below</strong> and paste it into <code>data/meetings.json</code> in your project folder. Then redeploy to Netlify.</p>' +
      '<textarea style="width:100%;height:400px;font-family:monospace;font-size:12px;">' +
      json.replace(/</g, '&lt;') +
      '</textarea>' +
      '<p>Total meetings: ' + meetings.length + '</p>'
    )
    .setWidth(600)
    .setHeight(550)
    .setTitle('meetings.json');

  SpreadsheetApp.getUi().showModalDialog(html, 'Meetings JSON');
}

/**
 * Helper: convert a string to a URL-safe slug
 */
function slugify(str) {
  return String(str).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Add a custom menu to the spreadsheet for easy access
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Dayton Informs')
    .addItem('Generate obituaries.json', 'generateObituariesJson')
    .addItem('Generate meetings.json', 'generateMeetingsJson')
    .addToUi();
}

/**
 * Helper: format dates from Google Sheets (which may be Date objects) to YYYY-MM-DD strings
 */
function formatSheetDate(value) {
  if (!value) return '';
  if (value instanceof Date) {
    var y = value.getFullYear();
    var m = ('0' + (value.getMonth() + 1)).slice(-2);
    var d = ('0' + value.getDate()).slice(-2);
    return y + '-' + m + '-' + d;
  }
  return String(value);
}
