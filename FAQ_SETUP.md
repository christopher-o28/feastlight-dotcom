# FAQ Submissions Setup - Google Sheets Integration

This guide helps you set up Google Sheets to automatically store FAQ form submissions from your website.

## Step 1: Create a Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet (name it "Feast Light FAQ Submissions")
3. Create a sheet tab named **"FAQSubmissions"** (exact name required)
4. Add these column headers in the first row:
   - **A1**: `timestamp`
   - **B1**: `name`
   - **C1**: `email`
   - **D1**: `concern`
   - **E1**: `question`

## Step 2: Create a Google Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any default code and replace with this:

```javascript
function doPost(e) {
  // Get the spreadsheet and sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('FAQSubmissions');
  
  // Get form data from the request
  const params = e.parameter;
  
  // Add a new row with the form data
  sheet.appendRow([
    params.timestamp || new Date().toISOString(),
    params.name || '',
    params.email || '',
    params.concern || '',
    params.question || ''
  ]);
  
  // Return success response
  return ContentService.createTextOutput(JSON.stringify({
    result: 'success'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

3. Click **Deploy → New deployment**
4. Select deployment type: **Web app**
5. Set "Execute as" to your Google account
6. Set "Who has access" to "Anyone"
7. Click **Deploy**
8. Copy the **deployment URL** (looks like: `https://script.google.com/macros/d/...`)

## Step 3: Add Environment Variable

1. Create or edit your `.env` file in the project root
2. Add this line:
```
VITE_FAQ_SCRIPT_URL=https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercreated
```

3. Replace `YOUR_SCRIPT_ID` with the ID from your deployment URL

4. Restart your development server

## Step 4: Test It!

1. Go to your website FAQ section
2. Fill out the form and submit
3. Check your Google Sheet - the submission should appear in the "FAQSubmissions" sheet

## Troubleshooting

**Form not submitting?**
- Check that `VITE_FAQ_SCRIPT_URL` is set correctly in .env
- Ensure the "FAQSubmissions" sheet tab exists in your Google Sheet
- Check browser console for errors (F12 → Console tab)

**Script deployed but not receiving data?**
- Verify the sheet tab is named exactly "FAQSubmissions"
- Make sure the Apps Script deployment is set to "Anyone" access
- Try deploying a new version of the script

**Getting CORS errors?**
- The script uses `no-cors` mode which shouldn't have CORS issues
- If still having problems, the submission still goes through even if you see an error

## Optional: Add Data Validation

To make the sheet more organized, you can add these features:

1. **Freeze the header row**: Select row 1 → View → Freeze → 1 row
2. **Add filters**: Select row 1 → Data → Create a filter
3. **Format email column**: Select column C → Data → Data validation → Email address

## Optional: Email Notifications

To get notified when submissions come in, add this to your Apps Script:

```javascript
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('FAQSubmissions');
  const params = e.parameter;
  
  sheet.appendRow([
    params.timestamp || new Date().toISOString(),
    params.name || '',
    params.email || '',
    params.concern || '',
    params.question || ''
  ]);
  
  // Send email notification
  GmailApp.sendEmail(
    'your-email@gmail.com', // Change this to your email
    'New FAQ Submission from Feast Light',
    `New submission from ${params.name}:\n\nEmail: ${params.email}\nConcern: ${params.concern}\n\nQuestion:\n${params.question}`
  );
  
  return ContentService.createTextOutput(JSON.stringify({
    result: 'success'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

---

**Questions?** Check the browser console (F12) for any error messages that can help diagnose issues.
