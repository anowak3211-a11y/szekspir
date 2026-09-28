import { google } from "googleapis";

const OWNER_EMAIL = process.argv[2];
if (!OWNER_EMAIL) {
  console.error("Usage: node scripts/setup-sheet.mjs you@gmail.com");
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  keyFile: "google-service-account.json",
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
  ],
});

const sheets = google.sheets({ version: "v4", auth });
const drive = google.drive({ version: "v3", auth });

const created = await sheets.spreadsheets.create({
  requestBody: {
    properties: { title: "Ad Localizer US→UK" },
    sheets: [{ properties: { title: "Scripts", gridProperties: { frozenRowCount: 1 } } }],
  },
});
const id = created.data.spreadsheetId;

await sheets.spreadsheets.values.update({
  spreadsheetId: id,
  range: "Scripts!A1:G1",
  valueInputOption: "RAW",
  requestBody: {
    values: [["Date", "Name", "US original", "UK version", "Changes", "Compliance flags", "Status"]],
  },
});

await drive.permissions.create({
  fileId: id,
  requestBody: { type: "user", role: "writer", emailAddress: OWNER_EMAIL },
  sendNotificationEmail: false,
});

console.log("SPREADSHEET_ID=" + id);
console.log("URL=https://docs.google.com/spreadsheets/d/" + id);
