# Codename Udaan — Lead Email + Google Sheet Setup

Leads from the website forms are sent to **udaancodname@gmail.com** and appended to a Google Sheet through a Google Apps Script web app.

## 1) Create the sheet

1. Open [Google Sheets](https://sheets.google.com) while logged into the Gmail that should own the sheet (ideally `udaancodname@gmail.com`).
2. Create a spreadsheet named **Codename Udaan Leads**.
3. Keep the first tab (it can be blank). The script creates a **Leads** tab automatically.

## 2) Install the script

1. In the sheet: **Extensions → Apps Script**.
2. Delete any default code.
3. Paste everything from `Code.gs` in this folder.
4. Click **Save**.

## 3) Deploy as web app

1. Click **Deploy → New deployment**.
2. Type: **Web app**.
3. Description: `Codename Udaan leads`.
4. Execute as: **Me**.
5. Who has access: **Anyone**.
6. Click **Deploy**, authorize permissions, then **copy the Web App URL**.

## 4) Connect the website

1. Open `js/app.js`.
2. Paste the Web App URL into:

```js
const LEAD_WEBHOOK_URL = 'https://script.google.com/macros/s/XXXX/exec';
```

3. Push / redeploy the site (Hostinger + GitHub).

## 5) Test

1. Submit any enquiry form on https://codenameudaan.in/
2. Confirm:
   - New row in the **Leads** sheet
   - Email arrives at **udaancodname@gmail.com**

If email is missing, check Spam and re-authorize the Apps Script deployment.
