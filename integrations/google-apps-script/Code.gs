/**
 * Codename Udaan — Lead Capture
 * Emails udaancodname@gmail.com + appends a Google Sheet row.
 *
 * IMPORTANT: Paste ONLY this file into Apps Script (Extensions → Apps Script).
 * Do not paste website HTML/JS. Apps Script has no browser `document` object.
 *
 * Deploy: Deploy → New deployment → Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Then copy the /exec URL into js/app.js → LEAD_WEBHOOK_URL
 */

var NOTIFY_EMAIL = 'udaancodname@gmail.com';
var SHEET_NAME = 'Leads';
// REQUIRED for standalone Apps Script projects (Untitled project):
// From your Sheet URL: https://docs.google.com/spreadsheets/d/THIS_PART/edit
// Paste THIS_PART below between the quotes.
var SHEET_ID = '1M_GugvptD5pm-50VedufBGCN5F1RekaqlIFPwXHx7E';

function doGet(e) {
  return respond_({ ok: true, service: 'Codename Udaan Lead Capture', hasSheetId: Boolean(SHEET_ID) });
}

function doPost(e) {
  try {
    var lead = normalizeLead_(parseBody_(e));
    writeLead_(lead);
    mailLead_(lead);
    return respond_({ ok: true, message: 'Lead saved and email sent' });
  } catch (err) {
    return respond_({ ok: false, message: String(err && err.message ? err.message : err) });
  }
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Empty request body');
  }
  var raw = String(e.postData.contents);
  if (raw.charAt(0) === '{') {
    return JSON.parse(raw);
  }
  var out = {};
  var pairs = raw.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var p = pairs[i].split('=');
    var k = decodeURIComponent((p[0] || '').replace(/\+/g, ' '));
    var v = decodeURIComponent((p.slice(1).join('=') || '').replace(/\+/g, ' '));
    if (k) out[k] = v;
  }
  return out;
}

function normalizeLead_(data) {
  data = data || {};
  var name = String(data.name || '').trim();
  var phone = String(data.phone || data.phoneE164 || '').trim();
  var email = String(data.email || '').trim();
  if (!name) throw new Error('Name is required');
  if (!phone) throw new Error('Phone is required');
  return {
    timestamp: String(data.timestamp || new Date().toISOString()),
    name: name,
    phone: phone,
    email: email || '—',
    config: String(data.config || data.configuration || '—').trim() || '—',
    formType: String(data.formType || data.type || 'Website Lead').trim() || 'Website Lead',
    visitDate: String(data.visitDate || data.visit_date || '—').trim() || '—',
    visitTime: String(data.visitTime || data.visit_time || '—').trim() || '—',
    source: String(data.source || data.page || 'https://codenameudaan.in/').trim()
  };
}

function writeLead_(lead) {
  var ss = null;
  if (SHEET_ID) {
    ss = SpreadsheetApp.openById(SHEET_ID);
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  if (!ss) {
    throw new Error('Set SHEET_ID in Code.gs to your Google Sheet ID (from the Sheet URL).');
  }
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Name', 'Phone', 'Email', 'Configuration', 'Form Type', 'Visit Date', 'Visit Time', 'Source Page']);
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([
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

function mailLead_(lead) {
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: 'New Codename Udaan Lead — ' + lead.name + ' (' + lead.formType + ')',
    body: [
      'New lead from Codename Udaan website',
      '',
      'Name: ' + lead.name,
      'Phone: ' + lead.phone,
      'Email: ' + lead.email,
      'Configuration: ' + lead.config,
      'Form / Purpose: ' + lead.formType,
      'Visit Date: ' + lead.visitDate,
      'Visit Time: ' + lead.visitTime,
      'Submitted At: ' + lead.timestamp,
      'Source: ' + lead.source
    ].join('\n'),
    replyTo: (lead.email && lead.email !== '—') ? lead.email : NOTIFY_EMAIL
  });
}

function respond_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
