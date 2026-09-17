/**
 * Codename Udaan — Lead Capture (Email + Google Sheet)
 *
 * SETUP (one-time):
 * 1. Create a Google Sheet named "Codename Udaan Leads".
 * 2. Extensions → Apps Script → paste this entire file → Save.
 * 3. Set NOTIFY_EMAIL below (already set to udaancodname@gmail.com).
 * 4. Deploy → New deployment → Type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Copy the Web App URL.
 * 6. Paste that URL into js/app.js as LEAD_WEBHOOK_URL.
 * 7. Submit a test lead from the website.
 *
 * Sheet columns (auto-created on first lead):
 * Timestamp | Name | Phone | Email | Configuration | Form Type | Visit Date | Visit Time | Source Page
 */

var NOTIFY_EMAIL = 'udaancodname@gmail.com';
var SHEET_NAME = 'Leads';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      service: 'Codename Udaan Lead Capture',
      email: NOTIFY_EMAIL
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var payload = parsePayload_(e);
    var lead = normalizeLead_(payload);

    appendLeadRow_(lead);
    sendLeadEmail_(lead);

    return json_({ ok: true, message: 'Lead saved and email sent.' });
  } catch (err) {
    return json_({ ok: false, message: String(err && err.message ? err.message : err) });
  }
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Empty request body.');
  }

  var raw = e.postData.contents;
  var type = String(e.postData.type || '').toLowerCase();

  if (type.indexOf('application/json') !== -1 || raw.trim().charAt(0) === '{') {
    return JSON.parse(raw);
  }

  // application/x-www-form-urlencoded fallback
  var out = {};
  var parts = raw.split('&');
  for (var i = 0; i < parts.length; i++) {
    var pair = parts[i].split('=');
    var key = decodeURIComponent((pair[0] || '').replace(/\+/g, ' '));
    var val = decodeURIComponent((pair.slice(1).join('=') || '').replace(/\+/g, ' '));
    out[key] = val;
  }
  return out;
}

function normalizeLead_(data) {
  var name = String(data.name || '').trim();
  var phone = String(data.phone || data.phoneE164 || '').trim();
  var email = String(data.email || '').trim();
  var config = String(data.config || data.configuration || '').trim();
  var formType = String(data.formType || data.type || 'Website Lead').trim();
  var visitDate = String(data.visitDate || data.visit_date || '').trim();
  var visitTime = String(data.visitTime || data.visit_time || '').trim();
  var source = String(data.source || data.page || 'https://codenameudaan.in/').trim();
  var timestamp = String(data.timestamp || new Date().toISOString()).trim();

  if (!name) throw new Error('Name is required.');
  if (!phone) throw new Error('Phone is required.');

  return {
    timestamp: timestamp,
    name: name,
    phone: phone,
    email: email || '—',
    config: config || '—',
    formType: formType,
    visitDate: visitDate || '—',
    visitTime: visitTime || '—',
    source: source
  };
}

function getLeadsSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Open this script from the Google Sheet (Extensions → Apps Script).');
  }

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp',
      'Name',
      'Phone',
      'Email',
      'Configuration',
      'Form Type',
      'Visit Date',
      'Visit Time',
      'Source Page'
    ]);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function appendLeadRow_(lead) {
  getLeadsSheet_().appendRow([
    lead.timestamp,
    lead.name,
    lead.phone,
    lead.email,
    lead.config,
    lead.formType,
    lead.visitDate,
    lead.visitTime,
    lead.source
  ]);
}

function sendLeadEmail_(lead) {
  var subject = 'New Codename Udaan Lead — ' + lead.name + ' (' + lead.formType + ')';
  var body = [
    'New lead received from Codename Udaan website.',
    '',
    'Name: ' + lead.name,
    'Phone: ' + lead.phone,
    'Email: ' + lead.email,
    'Configuration: ' + lead.config,
    'Form / Purpose: ' + lead.formType,
    'Preferred Visit Date: ' + lead.visitDate,
    'Preferred Visit Time: ' + lead.visitTime,
    'Submitted At: ' + lead.timestamp,
    'Source: ' + lead.source,
    '',
    '— Auto notification from Codename Udaan lead form'
  ].join('\n');

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: subject,
    body: body,
    replyTo: (lead.email && lead.email !== '—') ? lead.email : NOTIFY_EMAIL
  });
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Optional manual test from the Apps Script editor:
 * Run testLead_() once after deploy to verify Sheet + email.
 */
function testLead_() {
  appendLeadRow_({
    timestamp: new Date().toISOString(),
    name: 'Test Lead',
    phone: '+919619124440',
    email: 'test@example.com',
    config: '2 BHK Luxury',
    formType: 'Manual Script Test',
    visitDate: '—',
    visitTime: '—',
    source: 'Apps Script Editor'
  });
  sendLeadEmail_({
    timestamp: new Date().toISOString(),
    name: 'Test Lead',
    phone: '+919619124440',
    email: 'test@example.com',
    config: '2 BHK Luxury',
    formType: 'Manual Script Test',
    visitDate: '—',
    visitTime: '—',
    source: 'Apps Script Editor'
  });
}
