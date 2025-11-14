require('dotenv').config();
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const dbPath = path.join(__dirname, 'db.json');

// Helper to read/write db.json
const readDb = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const writeDb = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

// Twilio setup (placeholders)
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Auth endpoints
app.post('/api/register', (req, res) => {
    const { email, phone } = req.body;
    const db = readDb();
    const existing = db.users.find(u => u.email === email || u.phone === phone);
    if (existing) return res.status(400).json({ error: 'User exists' });
    const user = { id: Date.now(), email, phone, verified: false };
    db.users.push(user);
    writeDb(db);
    res.json({ userId: user.id });
});

app.post('/api/otp-send', (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit
    // In real, send via Twilio: twilioClient.messages.create({ body: `OTP: ${otp}`, from: process.env.TWILIO_PHONE, to: phone });
    console.log(`OTP for ${phone}: ${otp}`); // Placeholder
    res.json({ success: true });
});

app.post('/api/otp-verify', (req, res) => {
    const { phone, otp } = req.body;
    // Placeholder: assume OTP is 123456
    if (otp === '123456') {
        const db = readDb();
        const user = db.users.find(u => u.phone === phone);
        if (user) user.verified = true;
        writeDb(db);
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'Invalid OTP' });
    }
});

// Google auth placeholder (client-side handled)
app.get('/api/auth/google', (req, res) => {
    // Placeholder: in real, handle OAuth callback
    res.json({ token: 'google-token-placeholder' });
});

// Tours
app.get('/api/tours', (req, res) => {
    const db = readDb();
    res.json(db.tours);
});

app.post('/api/tours', (req, res) => {
    const { userId, places } = req.body;
    const db = readDb();
    const tour = { id: Date.now(), userId, places };
    db.tours.push(tour);
    writeDb(db);
    res.json(tour);
});

// Places and SOS (use db.json)
app.get('/api/places', (req, res) => {
    const db = readDb();
    res.json(db.places);
});

app.get('/api/sos', (req, res) => {
    const db = readDb();
    res.json(db.sos);
});

// Location for SOS
app.post('/api/location', (req, res) => {
    const { lat, lng } = req.body;
    console.log(`Location shared: ${lat}, ${lng}`);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
