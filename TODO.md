# North India Tourism App - Vanilla HTML/CSS/JS PWA Implementation

## Backend (Express + JSON Server)
- [x] Update package.json: Add twilio for OTP, dotenv for keys
- [x] Update server.js: Add auth endpoints (/api/register, /api/otp-send, /api/otp-verify, /api/auth/google)
- [x] Update db.json: Add users, tours, lat/lng to places
- [x] Add /api/tours for saving/loading itineraries
- [x] Add /api/location for geolocation sharing in SOS

## Frontend (HTML/CSS/JS)
- [x] Update index.html: Add login section, maps div, tour planner, OTP inputs
- [x] Update app.js: Add Google Sign-In, OTP logic, maps integration, tour selection, geolocation for SOS
- [x] Update styles.css: Styles for new sections (login, maps, tours)
- [x] Create manifest.json for PWA
- [x] Complete sw.js for caching assets and API responses

## General
- [x] Add .env for API keys (placeholders)
- [ ] Test: Login/register, maps display, tour creation, SOS with location, offline mode
- [ ] Run: npm run dev (json-server) and npm start (express)
