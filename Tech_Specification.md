# Technical Specification – Unearth

---

# 1. Folder Structure (V1)

unearth/
│
├── index.html
├── style.css
├── app.js
├── manifest.json
├── service-worker.js
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── README.md

---

# 2. Data Model (V1)

Stored in LocalStorage as JSON:

{
  "items": {
    "Keys": {
      "totalLost": 5,
      "locations": {
        "Couch": 3,
        "Kitchen Table": 1,
        "Bedroom": 1
      },
      "logs": [
        {
          "lostAt": "2026-02-01T08:12:00",
          "foundAt": "Couch"
        }
      ]
    }
  }
}

---

# 3. Core Functions

addItem(name)
logLost(item)
logFound(item, location)
calculateTopLocations(item)
updateStats()

---

# 4. Prediction Logic (V1)

Algorithm:
1. Retrieve item.locations
2. Convert to array
3. Sort descending by frequency
4. Return top 3

Future Enhancement (V2):
Weighted scoring formula:

score = 
(locationFrequency * 0.6) +
(timeOfDayMatch * 0.2) +
(dayOfWeekMatch * 0.2)

---

# 5. Rendering Flow

User action →
Update data →
Save to LocalStorage →
Re-render UI →
Update stats

---

# 6. PWA Setup

manifest.json:
- name: Unearth
- short_name: Unearth
- start_url: /
- display: standalone
- background_color: #000
- theme_color: #000

Service Worker:
- Cache index.html
- Cache style.css
- Cache app.js
- Cache icons
- Enable offline support

---

# 7. Upgrade Architecture (V2)

Introduce:
- dataService.js
- authService.js
- paymentService.js

Abstract storage calls:

Instead of:
localStorage.getItem()

Use:
dataService.get()

So migration is seamless.