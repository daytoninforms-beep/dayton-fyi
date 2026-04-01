# Dayton Informs — Setup Instructions

Follow these steps in order. Each step tells you exactly what to do.

---

## Step 1: Create a Google Account (if you don't have one)

Go to https://accounts.google.com and create a free Google account, or use one you already have. This account will hold the spreadsheet that stores submissions and meeting data.

---

## Step 2: Create the Google Sheet

1. Go to https://sheets.google.com
2. Click **Blank spreadsheet** to create a new one
3. Name it **Dayton Informs Data** (click "Untitled spreadsheet" at the top left and type the name)
4. You should see a tab at the bottom called "Sheet1" — right-click it and rename it to **Submissions**
5. In the Submissions sheet, type these exact headers in Row 1 (one per cell, A1 through N1):

| A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ID | Status | Full Name | Date of Birth | Date of Death | City/Neighborhood | Survivors | Military Service | Military Branch | Remembrance | Submitter Name | Submitter Email | Submitted At | Published At |

6. Bold the header row: select Row 1, then press Ctrl+B
7. Freeze the header row: click **View > Freeze > 1 row**
8. Create a second tab: click the **+** button at the bottom left to add a new sheet. Rename it to **Meetings**
9. In the Meetings sheet, type these headers in Row 1:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Body Name | Meeting Type | Date | Time | Location | Virtual Link | Agenda Link |

10. Bold and freeze this header row too.

---

## Step 3: Set Up the Submission Receiver (Google Apps Script)

This connects the website's obituary form to your Google Sheet.

1. In your Google Sheet, click **Extensions > Apps Script**
2. This opens a code editor. You'll see a file called `Code.gs` with an empty function
3. **Delete everything** in that file
4. Open the file `google-apps-script/receive-submissions.js` from this project folder
5. **Copy the entire contents** of that file and **paste it** into the Apps Script editor
6. Click the **+** next to "Files" in the left sidebar and choose **Script**
7. Name the new file `Publish` (it will become `Publish.gs`)
8. Open the file `google-apps-script/publish-to-json.js` from this project folder
9. **Copy the entire contents** and **paste it** into the `Publish.gs` file
10. Click the **Save** button (floppy disk icon) or press Ctrl+S

### Deploy as a Web App

11. Click **Deploy > New deployment**
12. Click the gear icon next to "Select type" and choose **Web app**
13. Fill in:
    - **Description:** Dayton Informs Submissions
    - **Execute as:** Me
    - **Who has access:** Anyone
14. Click **Deploy**
15. It will ask you to authorize access — click **Authorize access**, choose your Google account, and if you see a "This app isn't verified" warning, click **Advanced > Go to Dayton Informs Data (unsafe)**. This is safe — it's your own script.
16. **Copy the Web app URL** that appears. It looks like: `https://script.google.com/macros/s/XXXXX/exec`
17. **Save this URL** — you'll need it in the next step.

### Connect the Website to the Script

18. Open the file `js/main.js` in this project folder
19. Find this line near the top: `var GOOGLE_SCRIPT_URL = '';`
20. Paste your web app URL between the quotes: `var GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/XXXXX/exec';`
21. Save the file

---

## Step 4: Test the Custom Menu

1. Go back to your Google Sheet and **reload the page**
2. After a few seconds, you should see a new menu item: **Dayton Informs**
3. Click it — you should see two options:
   - Generate obituaries.json
   - Generate meetings.json
4. These are what you'll use to publish approved submissions to the website

---

## Step 5: Create a GitHub Account and Repository

1. Go to https://github.com and create a free account (or sign in if you have one)
2. Click the **+** in the top right and choose **New repository**
3. Fill in:
   - **Repository name:** dayton-informs
   - **Description:** Dayton Community Information District prototype
   - **Visibility:** Public
4. Click **Create repository**
5. Leave this page open — you'll need the repository URL for Netlify

### Upload your project files

6. On the repository page, click **uploading an existing file** (or "Add file > Upload files")
7. Drag your entire project folder contents into the upload area:
   - `index.html`
   - `privacy.html`
   - `netlify.toml`
   - `css/` folder
   - `js/` folder
   - `data/` folder
   - `obituaries/` folder
   - `meetings/` folder
   - `about/` folder
8. Type a commit message like "Initial site files" and click **Commit changes**

---

## Step 6: Deploy to Netlify

1. Go to https://www.netlify.com and click **Sign up** — sign up with your GitHub account
2. Once logged in, click **Add new site > Import an existing project**
3. Choose **GitHub**
4. Authorize Netlify to access your GitHub account
5. Select your **dayton-informs** repository
6. On the deploy settings page:
   - **Branch to deploy:** main
   - **Build command:** leave blank
   - **Publish directory:** . (just a dot)
7. Click **Deploy site**
8. Netlify will deploy your site in about 30 seconds
9. It gives you a random URL like `https://random-name-12345.netlify.app` — this is your live site!

### Set up your custom domain (when ready)

10. Register your domain (`daytonfyi.com`) at a registrar like Namecheap (~$12/year)
11. In Netlify, go to **Site settings > Domain management > Add custom domain**
12. Enter `daytonfyi.com` and follow Netlify's instructions to point your domain's DNS
13. Netlify automatically provides free HTTPS — no additional setup needed

---

## Step 7: Set Up Substack Newsletter (when ready)

1. Go to https://substack.com and create a free publication
2. Name it **Dayton Informs**
3. In your Substack settings, find the **Embed signup form** option
4. Copy the embed code
5. In `about/index.html`, replace the "Newsletter signup coming soon" notice with the Substack embed code
6. Commit and push the change to GitHub — Netlify auto-deploys

---

## Day-to-Day Operations

### Reviewing obituary submissions

1. Open your Google Sheet
2. New submissions appear in the **Submissions** tab with Status = `PENDING`
3. Review the submission for completeness and appropriateness
4. Change Status to `APPROVED` if it should be published
5. Optionally fill in the **Published At** column with today's date
6. Click **Dayton Informs > Generate obituaries.json**
7. Copy the JSON from the popup dialog
8. Open `data/obituaries.json` in your project and replace its contents with what you copied
9. Upload the updated file to GitHub — Netlify auto-deploys and the obituary is live

### Adding meetings to the calendar

1. Open the **Meetings** tab in your Google Sheet
2. Add a new row for each meeting with: Body Name, Meeting Type (Regular/Special/Committee), Date, Time, Location, Virtual Link, Agenda Link
3. Click **Dayton Informs > Generate meetings.json**
4. Copy the JSON and replace `data/meetings.json` in your project
5. Upload to GitHub — the calendar updates automatically

### Redeploying after any change

Any time you push changes to GitHub, Netlify automatically rebuilds and deploys your site within about 30 seconds. No manual deploy step needed.
