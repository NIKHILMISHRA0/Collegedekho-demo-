let placesData = [];
let sosData = [];
let toursData = [];
let currentUser = null;
let map;

// DOM elements
const loginSection = document.getElementById('login-section');
const placesSection = document.getElementById('places-section');
const toursSection = document.getElementById('tours-section');
const mapsSection = document.getElementById('maps-section');
const sosSection = document.getElementById('sos-section');
const placesList = document.getElementById('places-list');
const sosList = document.getElementById('sos-list');
const toursList = document.getElementById('tours-list');
const placesCheckboxes = document.getElementById('places-checkboxes');
const tourPlanner = document.getElementById('tour-planner');

// Buttons
const loginBtn = document.getElementById('login-btn');
const placesBtn = document.getElementById('places-btn');
const toursBtn = document.getElementById('tours-btn');
const mapsBtn = document.getElementById('maps-btn');
const sosBtn = document.getElementById('sos-btn');
const createTourBtn = document.getElementById('create-tour');
const saveTourBtn = document.getElementById('save-tour');
const verifyOtpBtn = document.getElementById('verify-otp');

// Forms
const registerForm = document.getElementById('register-form');
const otpSection = document.getElementById('otp-section');

// Load data
async function loadData() {
    try {
        const [placesRes, sosRes, toursRes] = await Promise.all([
            fetch('/api/places'),
            fetch('/api/sos'),
            fetch('/api/tours')
        ]);
        placesData = await placesRes.json();
        sosData = await sosRes.json();
        toursData = await toursRes.json();
        localStorage.setItem('places', JSON.stringify(placesData));
        localStorage.setItem('sos', JSON.stringify(sosData));
        localStorage.setItem('tours', JSON.stringify(toursData));
    } catch (e) {
        placesData = JSON.parse(localStorage.getItem('places') || '[]');
        sosData = JSON.parse(localStorage.getItem('sos') || '[]');
        toursData = JSON.parse(localStorage.getItem('tours') || '[]');
    }
    currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    displayPlaces();
    displayTours();
}

// Display places
function displayPlaces() {
    placesList.innerHTML = '';
    placesData.forEach(place => {
        const div = document.createElement('div');
        div.className = 'place';
        div.innerHTML = `
            <h3>${place.name}</h3>
            <p><strong>Location:</strong> ${place.location}</p>
            <p>${place.description}</p>
        `;
        placesList.appendChild(div);
    });
}

// Display tours
function displayTours() {
    toursList.innerHTML = '';
    toursData.filter(t => !currentUser || t.userId == currentUser.id).forEach(tour => {
        const div = document.createElement('div');
        div.className = 'tour-item';
        const placeNames = tour.places.map(id => placesData.find(p => p.id == id)?.name).join(', ');
        div.innerHTML = `<h3>Tour</h3><p>Places: ${placeNames}</p>`;
        toursList.appendChild(div);
    });
}

// Display SOS
function displaySOS() {
    sosList.innerHTML = '';
    sosData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'sos-item';
        div.innerHTML = `
            <button onclick="call('${item.number}')">${item.name} (${item.number})</button>
        `;
        sosList.appendChild(div);
    });
}

// Call function with location
async function call(number) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async pos => {
            await fetch('/api/location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude })
            });
        });
    }
    window.location.href = `tel:${number}`;
}

// Google Sign-In
function onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    currentUser = { id: profile.getId(), email: profile.getEmail(), name: profile.getName() };
    localStorage.setItem('user', JSON.stringify(currentUser));
    loginSection.style.display = 'none';
    placesSection.style.display = 'block';
}

// Register form
registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, phone })
        });
        if (res.ok) {
            otpSection.style.display = 'block';
            await fetch('/api/otp-send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
        }
    } catch (e) { alert('Error registering'); }
});

// Verify OTP
verifyOtpBtn.addEventListener('click', async () => {
    const phone = document.getElementById('phone').value;
    const otp = document.getElementById('otp').value;
    try {
        const res = await fetch('/api/otp-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, otp })
        });
        if (res.ok) {
            currentUser = { id: Date.now(), email: document.getElementById('email').value, phone };
            localStorage.setItem('user', JSON.stringify(currentUser));
            loginSection.style.display = 'none';
            placesSection.style.display = 'block';
        } else {
            alert('Invalid OTP');
        }
    } catch (e) { alert('Error verifying'); }
});

// Tour planner
createTourBtn.addEventListener('click', () => {
    tourPlanner.style.display = 'block';
    placesCheckboxes.innerHTML = '';
    placesData.forEach(place => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" value="${place.id}"> ${place.name}`;
        placesCheckboxes.appendChild(label);
    });
});

saveTourBtn.addEventListener('click', async () => {
    const selected = Array.from(document.querySelectorAll('#places-checkboxes input:checked')).map(cb => +cb.value);
    if (selected.length && currentUser) {
        try {
            const res = await fetch('/api/tours', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, places: selected })
            });
            if (res.ok) {
                loadData();
                tourPlanner.style.display = 'none';
            }
        } catch (e) { alert('Error saving tour'); }
    }
});

// Maps
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 28.6139, lng: 77.2090 }, // Delhi
        zoom: 6
    });
    placesData.forEach(place => {
        new google.maps.Marker({
            position: { lat: place.lat, lng: place.lng },
            map: map,
            title: place.name
        });
    });
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            new google.maps.Marker({
                position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
                map: map,
                title: 'Your Location',
                icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            });
        });
    }
}

// Navigation
loginBtn.addEventListener('click', () => {
    showSection(loginSection);
});
placesBtn.addEventListener('click', () => {
    showSection(placesSection);
    displayPlaces();
});
toursBtn.addEventListener('click', () => {
    showSection(toursSection);
    displayTours();
});
mapsBtn.addEventListener('click', () => {
    showSection(mapsSection);
    if (!map) initMap();
});
sosBtn.addEventListener('click', () => {
    showSection(sosSection);
    displaySOS();
});

function showSection(section) {
    [loginSection, placesSection, toursSection, mapsSection, sosSection].forEach(s => s.style.display = 'none');
    section.style.display = 'block';
}

// Initial load
loadData();

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('SW registered'))
            .catch(e => console.log('SW failed', e));
    });
}
