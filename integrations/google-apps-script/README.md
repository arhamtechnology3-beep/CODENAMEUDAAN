# Fix the WhatsApp “sync pending” popup

That popup appears when Google Apps Script fails.

## Confirmed error on your current webhook

```text
ReferenceError: document is not defined (line 6, file "Code")
```

That means the Apps Script project still has **browser/website code** (or broken code).  
Apps Script is server-side — there is **no** `document`.

## Fix (required)

1. Open your **Codename Udaan Leads** Google Sheet  
2. **Extensions → Apps Script**
3. Delete **all** existing code
4. Paste **only** the contents of `Code.gs` from this folder
5. Save
6. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Authorize
8. Copy the new URL ending in `/exec`
9. Send that URL so we can update `LEAD_WEBHOOK_URL` in `js/app.js` (or paste it yourself)

## Quick test in Apps Script

After pasting `Code.gs`, you can also run `doGet` from the editor — it should return JSON like `{"ok":true,...}` with no errors.
