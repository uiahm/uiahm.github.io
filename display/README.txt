ADBREAKBOX DISPLAY ~ THE NELSON HOTEL (GitHub Pages version)
===========================================================

WHAT'S IN HERE
  display.html            The TV banner. Public, no login (screens can't type passwords).
  data/nelson-hotel.json  The Nelson's banner content. One JSON file per venue.
  admin/                  Login + editor. Saving a change commits to the GitHub repo.
  fonts/                  Drop the licensed Hill House font here as HillHouse.woff.

HOW THE LOGIN WORKS (no server needed)
  GitHub Pages can't check passwords, so the editor saves through GitHub itself.
  At setup you give it a GitHub token, which is stored in the repo as admin/auth.json,
  encrypted with your password. Logging in decrypts it in your browser; without the
  password the token can't be used. Use a long password, because auth.json is public
  if the repo is public.

SET UP
  1. Put this folder in the site repo, e.g. /display/
  2. Create a fine-grained GitHub token: github.com > Settings > Developer settings >
     Fine-grained tokens. Repository access: only the site repo.
     Permissions: Contents = Read and write. Set an expiry and note the date.
  3. Open https://www.adbreakbox.com/display/admin/setup.html, enter repo details,
     the token and a password (12+ characters).
  4. From then on log in at https://www.adbreakbox.com/display/admin/login.html

PUT IT ON A SCREEN
  With photo background:  /display/display.html?venue=nelson-hotel&bg=demo
  Transparent overlay:    /display/display.html?venue=nelson-hotel
  Saves publish in about a minute (GitHub Pages build), screens refresh every minute.

ADD ANOTHER VENUE
  Copy data/nelson-hotel.json to data/<venue-name>.json.

CHANGE PASSWORD / TOKEN EXPIRED
  Delete admin/auth.json in the repo, then run setup.html again.

FONT NOTE
  "Hill House" is The Nelson's custom font, currently loaded from their website.
  Get the file and licence confirmation from the venue or KRM and save it as
  fonts/HillHouse.woff.
